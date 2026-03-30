package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"Plotter/internal/ai"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

const ollamaBase = "http://localhost:11434"

// OllamaModel is returned to the frontend for display.
type OllamaModel struct {
	Name              string `json:"name"`
	Size              int64  `json:"size"`
	ParameterSize     string `json:"parameterSize"`
	QuantizationLevel string `json:"quantizationLevel"`
	Family            string `json:"family"`
}

// PullProgress is emitted as a Wails event during model download.
type PullProgress struct {
	Status    string  `json:"status"`
	Total     int64   `json:"total"`
	Completed int64   `json:"completed"`
	Percent   float64 `json:"percent"`
}

func (a *App) GetOllamaModels() ([]OllamaModel, error) {
	resp, err := http.Get(ollamaBase + "/api/tags")
	if err != nil {
		return nil, fmt.Errorf("ollama not reachable: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		Models []struct {
			Name    string `json:"name"`
			Size    int64  `json:"size"`
			Details struct {
				ParameterSize     string `json:"parameter_size"`
				QuantizationLevel string `json:"quantization_level"`
				Family            string `json:"family"`
			} `json:"details"`
		} `json:"models"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	models := make([]OllamaModel, len(result.Models))
	for i, m := range result.Models {
		models[i] = OllamaModel{
			Name:              m.Name,
			Size:              m.Size,
			ParameterSize:     m.Details.ParameterSize,
			QuantizationLevel: m.Details.QuantizationLevel,
			Family:            m.Details.Family,
		}
	}
	return models, nil
}

// PullModel starts a model download in the background and emits progress events.
func (a *App) PullModel(name string) {
	go func() {
		body, _ := json.Marshal(map[string]string{"name": name})
		resp, err := http.Post(ollamaBase+"/api/pull", "application/json", bytes.NewReader(body))
		if err != nil {
			runtime.EventsEmit(a.ctx, "model:pull:error", map[string]string{"name": name, "error": err.Error()})
			return
		}
		defer resp.Body.Close()

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			var raw struct {
				Status    string `json:"status"`
				Total     int64  `json:"total"`
				Completed int64  `json:"completed"`
			}
			if err := json.Unmarshal(scanner.Bytes(), &raw); err != nil {
				continue
			}
			p := PullProgress{Status: raw.Status, Total: raw.Total, Completed: raw.Completed}
			if raw.Total > 0 {
				p.Percent = float64(raw.Completed) / float64(raw.Total) * 100
			}
			runtime.EventsEmit(a.ctx, "model:pull:progress", map[string]interface{}{
				"name": name, "progress": p,
			})
		}

		runtime.EventsEmit(a.ctx, "model:pull:done", map[string]string{"name": name})
	}()
}

func (a *App) DeleteModel(name string) error {
	body, _ := json.Marshal(map[string]string{"name": name})
	req, err := http.NewRequest("DELETE", ollamaBase+"/api/delete", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("ollama not reachable: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("delete failed: %s", resp.Status)
	}
	return nil
}

func (a *App) GetActiveModel() string {
	return a.activeModel
}

func (a *App) SetActiveModel(name string) error {
	client, err := ai.NewClient(name)
	if err != nil {
		return err
	}
	a.aiClient = client
	a.activeModel = name
	return saveModelSetting(name)
}

// --- settings persistence ---

// ModelConfig holds per-model prompt customisation fields.
type ModelConfig struct {
	AIInstructions    string `json:"aiInstructions"`
	StoryInstructions string `json:"storyInstructions"`
	AuthorNotes       string `json:"authorNotes"`
}

type appSettings struct {
	ActiveModel  string                 `json:"activeModel"`
	ModelConfigs map[string]ModelConfig `json:"modelConfigs"`
}

func settingsPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "Plotter", "settings.json"), nil
}

func loadSettings(defaultModel string) appSettings {
	s := appSettings{ActiveModel: defaultModel, ModelConfigs: map[string]ModelConfig{}}
	path, err := settingsPath()
	if err != nil {
		return s
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return s
	}
	_ = json.Unmarshal(data, &s)
	if s.ActiveModel == "" {
		s.ActiveModel = defaultModel
	}
	if s.ModelConfigs == nil {
		s.ModelConfigs = map[string]ModelConfig{}
	}
	return s
}

func saveSettings(s appSettings) error {
	path, err := settingsPath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	data, err := json.Marshal(s)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func loadModelSetting(defaultModel string) string {
	return loadSettings(defaultModel).ActiveModel
}

func saveModelSetting(model string) error {
	s := loadSettings(model)
	s.ActiveModel = model
	return saveSettings(s)
}

func (a *App) GetModelConfig(model string) (ModelConfig, error) {
	s := loadSettings("")
	if cfg, ok := s.ModelConfigs[model]; ok {
		return cfg, nil
	}
	return ModelConfig{}, nil
}

func (a *App) SaveModelConfig(model, aiInstructions, storyInstructions, authorNotes string) error {
	s := loadSettings("")
	s.ModelConfigs[model] = ModelConfig{
		AIInstructions:    aiInstructions,
		StoryInstructions: storyInstructions,
		AuthorNotes:       authorNotes,
	}
	return saveSettings(s)
}
