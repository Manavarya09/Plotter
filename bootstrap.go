package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"
)

const (
	defaultQwenModel  = "qwen3.5:latest"
	defaultLlamaModel = "llama4:latest"

	minRAMForLlamaGB  = 16
	minVRAMForLlamaGB = 8
)

type HardwareProfile struct {
	OS          string
	Arch        string
	TotalRAMGB  float64
	HasGPU      bool
	GPUVRAMGB   float64
	DetectedGPU string
}

type BootstrapConfig struct {
	QwenModel        string
	LlamaModel       string
	MinRAMForLlamaGB int
	MinVRAMForLlama  int
}

var defaultBootstrapConfig = BootstrapConfig{
	QwenModel:        defaultQwenModel,
	LlamaModel:       defaultLlamaModel,
	MinRAMForLlamaGB: minRAMForLlamaGB,
	MinVRAMForLlama:  minVRAMForLlamaGB,
}

func BootstrapEnvironment(ctx context.Context) (string, error) {
	return bootstrapEnvironmentWithConfig(ctx, defaultBootstrapConfig)
}

func bootstrapEnvironmentWithConfig(ctx context.Context, cfg BootstrapConfig) (string, error) {
	log.Printf("[bootstrap] starting setup")

	if !isOllamaInstalled() {
		log.Printf("[bootstrap] ollama not found; installing")
		if err := installOllama(ctx); err != nil {
			return "", fmt.Errorf("failed to install ollama: %w", err)
		}
	} else {
		log.Printf("[bootstrap] ollama already installed")
	}

	if err := ensureOllamaRunning(ctx); err != nil {
		return "", fmt.Errorf("failed to start ollama: %w", err)
	}

	hw := detectHardwareProfile()
	log.Printf("[bootstrap] hardware detected: os=%s arch=%s ram=%.1fGB gpu=%t gpuVram=%.1fGB gpuName=%q",
		hw.OS, hw.Arch, hw.TotalRAMGB, hw.HasGPU, hw.GPUVRAMGB, hw.DetectedGPU)

	primary := selectPrimaryModel(hw, cfg)
	candidates := orderedModelCandidates(primary, cfg)
	log.Printf("[bootstrap] model candidates: %v", candidates)

	for _, model := range candidates {
		if err := ensureModelPresent(ctx, model); err != nil {
			log.Printf("[bootstrap] failed to prepare model %q: %v", model, err)
			continue
		}
		if err := runModelHealthCheck(ctx, model); err != nil {
			log.Printf("[bootstrap] health check failed for %q: %v", model, err)
			continue
		}
		log.Printf("[bootstrap] model ready: %s", model)
		return model, nil
	}

	return "", errors.New("no candidate model could be prepared")
}

func isOllamaInstalled() bool {
	_, err := exec.LookPath("ollama")
	return err == nil
}

func installOllama(ctx context.Context) error {
	switch runtime.GOOS {
	case "linux":
		return runCommand(ctx, "sh", "-c", "curl -fsSL https://ollama.com/install.sh | sh")
	case "darwin":
		if _, err := exec.LookPath("brew"); err == nil {
			return runCommand(ctx, "brew", "install", "ollama")
		}
		return errors.New("homebrew not found; install ollama from https://ollama.com/download/mac")
	case "windows":
		if _, err := exec.LookPath("winget"); err == nil {
			return runCommand(ctx, "winget", "install", "-e", "--id", "Ollama.Ollama")
		}
		if _, err := exec.LookPath("choco"); err == nil {
			return runCommand(ctx, "choco", "install", "ollama", "-y")
		}
		return errors.New("no supported package manager found on Windows; install from https://ollama.com/download/windows")
	default:
		return fmt.Errorf("unsupported OS: %s", runtime.GOOS)
	}
}

func ensureOllamaRunning(ctx context.Context) error {
	if isOllamaReachable(2 * time.Second) {
		return nil
	}

	if err := startOllamaDaemon(); err != nil {
		log.Printf("[bootstrap] ollama serve start attempt failed: %v", err)
	}

	deadline := time.Now().Add(45 * time.Second)
	for time.Now().Before(deadline) {
		if isOllamaReachable(2 * time.Second) {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(1500 * time.Millisecond):
		}
	}

	return errors.New("ollama API did not become reachable on http://localhost:11434")
}

func isOllamaReachable(timeout time.Duration) bool {
	client := &http.Client{Timeout: timeout}
	resp, err := client.Get(ollamaBase + "/api/tags")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode >= 200 && resp.StatusCode < 500
}

func startOllamaDaemon() error {
	cmd := exec.Command("ollama", "serve")
	cmd.Stdout = io.Discard
	cmd.Stderr = io.Discard
	return cmd.Start()
}

func detectHardwareProfile() HardwareProfile {
	ramGB := detectTotalRAMGB()
	gpuName, vramGB := detectGPUInfo()

	return HardwareProfile{
		OS:          runtime.GOOS,
		Arch:        runtime.GOARCH,
		TotalRAMGB:  ramGB,
		HasGPU:      gpuName != "" || vramGB > 0,
		GPUVRAMGB:   vramGB,
		DetectedGPU: gpuName,
	}
}

func detectTotalRAMGB() float64 {
	switch runtime.GOOS {
	case "linux":
		b, err := os.ReadFile("/proc/meminfo")
		if err != nil {
			return 0
		}
		re := regexp.MustCompile(`(?m)^MemTotal:\s+(\d+)\s+kB$`)
		m := re.FindStringSubmatch(string(b))
		if len(m) != 2 {
			return 0
		}
		kb, _ := strconv.ParseFloat(m[1], 64)
		return kb / 1024 / 1024
	case "darwin":
		out, err := exec.Command("sysctl", "-n", "hw.memsize").Output()
		if err != nil {
			return 0
		}
		bytesVal, _ := strconv.ParseFloat(strings.TrimSpace(string(out)), 64)
		return bytesVal / 1024 / 1024 / 1024
	case "windows":
		out, err := exec.Command("wmic", "computersystem", "get", "totalphysicalmemory", "/value").Output()
		if err != nil {
			return 0
		}
		re := regexp.MustCompile(`(?i)TotalPhysicalMemory=(\d+)`)
		m := re.FindStringSubmatch(string(out))
		if len(m) != 2 {
			return 0
		}
		bytesVal, _ := strconv.ParseFloat(m[1], 64)
		return bytesVal / 1024 / 1024 / 1024
	default:
		return 0
	}
}

func detectGPUInfo() (string, float64) {
	if name, gb, err := detectNvidiaGPU(); err == nil {
		return name, gb
	}

	if runtime.GOOS == "darwin" {
		out, err := exec.Command("system_profiler", "SPDisplaysDataType").Output()
		if err == nil {
			name := parseMacGPUName(string(out))
			gb := parseMacVRAMGB(string(out))
			return name, gb
		}
	}

	if runtime.GOOS == "windows" {
		out, err := exec.Command("wmic", "path", "win32_VideoController", "get", "name,AdapterRAM", "/value").Output()
		if err == nil {
			name, gb := parseWindowsGPU(string(out))
			return name, gb
		}
	}

	return "", 0
}

func detectNvidiaGPU() (string, float64, error) {
	if _, err := exec.LookPath("nvidia-smi"); err != nil {
		return "", 0, err
	}
	out, err := exec.Command("nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits").Output()
	if err != nil {
		return "", 0, err
	}
	line := strings.TrimSpace(string(out))
	if line == "" {
		return "", 0, errors.New("no nvidia gpu output")
	}
	parts := strings.Split(line, ",")
	if len(parts) < 2 {
		return "", 0, errors.New("unexpected nvidia-smi format")
	}
	name := strings.TrimSpace(parts[0])
	mb, _ := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
	return name, mb / 1024, nil
}

func parseMacGPUName(out string) string {
	re := regexp.MustCompile(`(?m)^\s*Chipset Model:\s*(.+)$`)
	m := re.FindStringSubmatch(out)
	if len(m) == 2 {
		return strings.TrimSpace(m[1])
	}
	return ""
}

func parseMacVRAMGB(out string) float64 {
	reGB := regexp.MustCompile(`(?im)^\s*VRAM[^:]*:\s*(\d+(?:\.\d+)?)\s*GB`)
	m := reGB.FindStringSubmatch(out)
	if len(m) == 2 {
		v, _ := strconv.ParseFloat(m[1], 64)
		return v
	}
	reMB := regexp.MustCompile(`(?im)^\s*VRAM[^:]*:\s*(\d+(?:\.\d+)?)\s*MB`)
	m = reMB.FindStringSubmatch(out)
	if len(m) == 2 {
		v, _ := strconv.ParseFloat(m[1], 64)
		return v / 1024
	}
	return 0
}

func parseWindowsGPU(out string) (string, float64) {
	reName := regexp.MustCompile(`(?im)^Name=(.+)$`)
	reRAM := regexp.MustCompile(`(?im)^AdapterRAM=(\d+)$`)
	nameMatch := reName.FindStringSubmatch(out)
	ramMatch := reRAM.FindStringSubmatch(out)

	name := ""
	if len(nameMatch) == 2 {
		name = strings.TrimSpace(nameMatch[1])
	}
	if len(ramMatch) == 2 {
		bytesVal, _ := strconv.ParseFloat(strings.TrimSpace(ramMatch[1]), 64)
		return name, bytesVal / 1024 / 1024 / 1024
	}
	return name, 0
}

func selectPrimaryModel(hw HardwareProfile, cfg BootstrapConfig) string {
	if hw.TotalRAMGB >= float64(cfg.MinRAMForLlamaGB) && hw.GPUVRAMGB >= float64(cfg.MinVRAMForLlama) {
		return cfg.LlamaModel
	}
	if hw.TotalRAMGB >= float64(cfg.MinRAMForLlamaGB) && !hw.HasGPU {
		return cfg.LlamaModel
	}
	return cfg.QwenModel
}

func orderedModelCandidates(primary string, cfg BootstrapConfig) []string {
	if primary == cfg.LlamaModel {
		return []string{cfg.LlamaModel, cfg.QwenModel}
	}
	if primary == cfg.QwenModel {
		return []string{cfg.QwenModel, cfg.LlamaModel}
	}
	return []string{cfg.QwenModel, cfg.LlamaModel}
}

func ensureModelPresent(ctx context.Context, model string) error {
	present, err := hasModel(model)
	if err != nil {
		return err
	}
	if present {
		log.Printf("[bootstrap] model already present: %s", model)
		return nil
	}

	log.Printf("[bootstrap] pulling model: %s", model)
	body, _ := json.Marshal(map[string]interface{}{
		"name":   model,
		"stream": false,
	})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, ollamaBase+"/api/pull", bytes.NewReader(body))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 45 * time.Minute}
	resp, err := client.Do(request)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("pull failed status=%s body=%s", resp.Status, strings.TrimSpace(string(raw)))
	}
	return nil
}

func hasModel(model string) (bool, error) {
	resp, err := http.Get(ollamaBase + "/api/tags")
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return false, fmt.Errorf("failed to query models: %s", resp.Status)
	}

	var result struct {
		Models []struct {
			Name string `json:"name"`
		} `json:"models"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}

	needle := strings.ToLower(strings.TrimSpace(model))
	needleBase := strings.TrimSuffix(needle, ":latest")
	for _, m := range result.Models {
		candidate := strings.ToLower(strings.TrimSpace(m.Name))
		if candidate == needle || strings.HasPrefix(candidate, needleBase+":") {
			return true, nil
		}
	}
	return false, nil
}

func runModelHealthCheck(ctx context.Context, model string) error {
	body, _ := json.Marshal(map[string]interface{}{
		"model":  model,
		"prompt": "Reply with: ok",
		"stream": false,
	})
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, ollamaBase+"/api/generate", bytes.NewReader(body))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(request)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("health check failed status=%s body=%s", resp.Status, strings.TrimSpace(string(raw)))
	}

	var result struct {
		Response string `json:"response"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}
	if strings.TrimSpace(result.Response) == "" {
		return errors.New("empty model response")
	}
	return nil
}

func runCommand(ctx context.Context, name string, args ...string) error {
	cmd := exec.CommandContext(ctx, name, args...)
	out, err := cmd.CombinedOutput()
	if err != nil {
		if len(out) > 0 {
			return fmt.Errorf("%w: %s", err, strings.TrimSpace(string(out)))
		}
		return err
	}
	return nil
}
