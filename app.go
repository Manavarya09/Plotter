package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"Plotter/internal/ai"
	"Plotter/internal/store"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func jsonUnmarshalChars(s string, out *[]store.Character) error {
	return json.Unmarshal([]byte(s), out)
}

func jsonMarshalChars(chars []store.Character) ([]byte, error) {
	return json.Marshal(chars)
}

type App struct {
	ctx         context.Context
	store       *store.Store
	aiClient    *ai.Client
	activeModel string
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	selectedModel, bootstrapErr := BootstrapEnvironment(ctx)
	if bootstrapErr != nil {
		log.Printf("warning: bootstrap setup failed: %v", bootstrapErr)
	}

	s, err := store.New()
	if err != nil {
		log.Fatalf("failed to init store: %v", err)
	}
	a.store = s

	defaultModel := defaultQwenModel
	if selectedModel != "" {
		defaultModel = selectedModel
	}

	settings := loadSettings("")
	if settings.ActiveModel == "" && selectedModel != "" {
		if err := saveModelSetting(selectedModel); err != nil {
			log.Printf("warning: failed to persist selected model %q: %v", selectedModel, err)
		}
	}

	a.activeModel = loadModelSetting(defaultModel)
	aiClient, err := ai.NewClient(a.activeModel)
	if err != nil {
		log.Printf("warning: ollama not available: %v", err)
	}
	a.aiClient = aiClient
}

func (a *App) domReady(ctx context.Context) {}

func (a *App) beforeClose(ctx context.Context) bool {
	return false
}

func (a *App) shutdown(ctx context.Context) {}

// --- Story methods (exposed to frontend) ---

func (a *App) GetStories() ([]store.Story, error) {
	return a.store.GetStories()
}

func (a *App) GetStory(id string) (store.Story, error) {
	return a.store.GetStory(id)
}

func (a *App) CreateStory(title, genre, synopsis string) (store.Story, error) {
	return a.store.CreateStory(title, genre, synopsis)
}

func (a *App) UpdateStory(id, title, genre, synopsis string) (store.Story, error) {
	return a.store.UpdateStory(id, title, genre, synopsis)
}

func (a *App) DeleteStory(id string) error {
	return a.store.DeleteStory(id)
}

func (a *App) UpdateStoryStatus(id, status string) (store.Story, error) {
	return a.store.UpdateStoryStatus(id, status)
}

// PickStoryCoverImage opens a file dialog, converts the chosen image to a
// base64 data URL and saves it to the story. Returns the updated story.
func (a *App) PickStoryCoverImage(storyID string) (store.Story, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Cover Image",
		Filters: []runtime.FileFilter{
			{DisplayName: "Images (*.jpg, *.jpeg, *.png, *.webp)", Pattern: "*.jpg;*.jpeg;*.png;*.webp"},
		},
	})
	if err != nil || path == "" {
		// User cancelled — return current story unchanged
		return a.store.GetStory(storyID)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return store.Story{}, err
	}
	mime := "image/jpeg"
	switch strings.ToLower(filepath.Ext(path)) {
	case ".png":
		mime = "image/png"
	case ".webp":
		mime = "image/webp"
	}
	dataURL := "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(data)
	return a.store.UpdateStoryCover(storyID, dataURL)
}

func (a *App) ClearStoryCoverImage(storyID string) (store.Story, error) {
	return a.store.UpdateStoryCover(storyID, "")
}

// UpdateStorySettings saves per-story AI and narrative settings.
// Characters is a JSON string of [{id,name,description}] from the frontend.
func (a *App) UpdateStorySettings(id, activeModel string, nsfw bool, aiInstructions, authorNotes, storyOutline, charactersJSON string) (store.Story, error) {
	var chars []store.Character
	if err := jsonUnmarshalChars(charactersJSON, &chars); err != nil || chars == nil {
		chars = []store.Character{}
	}
	return a.store.UpdateStorySettings(id, activeModel, nsfw, aiInstructions, authorNotes, storyOutline, chars)
}

// --- User Template methods (exposed to frontend) ---

func (a *App) GetUserTemplates() ([]store.UserTemplate, error) {
	return a.store.GetUserTemplates()
}

// CreateUserTemplate saves a new user-created template.
// moodsJSON is a JSON array of strings; charactersJSON is [{id,name,description}].
func (a *App) CreateUserTemplate(name, genre, tagline, description, moodsJSON, icon string, nsfw bool, synopsis, aiInstructions, authorNotes, storyOutline, charactersJSON string) (store.UserTemplate, error) {
	var moods []string
	if err := json.Unmarshal([]byte(moodsJSON), &moods); err != nil || moods == nil {
		moods = []string{}
	}
	var chars []store.Character
	if err := jsonUnmarshalChars(charactersJSON, &chars); err != nil || chars == nil {
		chars = []store.Character{}
	}
	return a.store.CreateUserTemplate(name, genre, tagline, description, moods, icon, nsfw, synopsis, aiInstructions, authorNotes, storyOutline, chars)
}

func (a *App) DeleteUserTemplate(id string) error {
	return a.store.DeleteUserTemplate(id)
}

// --- Session methods (exposed to frontend) ---

func (a *App) GetSessions(storyID string) ([]store.Session, error) {
	return a.store.GetSessions(storyID)
}

func (a *App) SaveSession(storyID, title, content string) (store.Session, error) {
	log.Printf("SaveSession called: storyID=%q title=%q contentLen=%d", storyID, title, len(content))
	s, err := a.store.SaveSession(storyID, title, content)
	if err != nil {
		log.Printf("SaveSession error: %v", err)
	} else {
		log.Printf("SaveSession ok: id=%q", s.ID)
	}
	return s, err
}

func (a *App) DeleteSession(storyID, sessionID string) error {
	return a.store.DeleteSession(storyID, sessionID)
}

// --- Theme methods (exposed to frontend) ---

func (a *App) backgroundPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, "Plotter", "background.dat"), nil
}

func (a *App) PickBackgroundImage() (string, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Background Image",
		Filters: []runtime.FileFilter{
			{DisplayName: "Images (*.jpg, *.jpeg, *.png, *.webp)", Pattern: "*.jpg;*.jpeg;*.png;*.webp"},
		},
	})
	if err != nil || path == "" {
		return "", err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	mime := "image/jpeg"
	switch strings.ToLower(filepath.Ext(path)) {
	case ".png":
		mime = "image/png"
	case ".webp":
		mime = "image/webp"
	}

	dataURL := "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(data)

	dest, err := a.backgroundPath()
	if err == nil {
		_ = os.WriteFile(dest, []byte(dataURL), 0644)
	}

	return dataURL, nil
}

func (a *App) GetBackground() (string, error) {
	path, err := a.backgroundPath()
	if err != nil {
		return "", err
	}
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return "", nil
	}
	return string(data), err
}

func (a *App) ClearBackground() error {
	path, err := a.backgroundPath()
	if err != nil {
		return err
	}
	err = os.Remove(path)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}

// --- AI methods (exposed to frontend) ---

// ChatMessage is the unit of conversation history passed from the frontend.
type ChatMessage struct {
	Role    string `json:"role"` // "narrator" or "player"
	Mode    string `json:"mode"` // "act" or "speak"
	Content string `json:"content"`
}

// StreamMessage loads story settings and streams a narrator response token by token.
func (a *App) StreamMessage(storyID string, history []ChatMessage, userMessage, mode string) {
	story, err := a.store.GetStory(storyID)
	if err != nil {
		runtime.EventsEmit(a.ctx, "chat:error", "Could not load story: "+err.Error())
		return
	}

	client := a.aiClient
	modelName := a.activeModel
	if story.ActiveModel != "" && story.ActiveModel != a.activeModel {
		modelName = story.ActiveModel
		if c, err := ai.NewClient(modelName); err == nil {
			client = c
		}
	}
	if client == nil {
		runtime.EventsEmit(a.ctx, "chat:error", "Ollama is not connected. Please ensure Ollama is running.")
		return
	}

	aiHistory := make([]ai.Message, len(history))
	for i, m := range history {
		aiHistory[i] = ai.Message{Role: m.Role, Mode: m.Mode, Content: m.Content}
	}

	// Merge model-level config with story-level overrides
	cfg, _ := a.GetModelConfig(modelName)
	aiInstructions := cfg.AIInstructions
	if story.AIInstructions != "" {
		aiInstructions = story.AIInstructions
	}
	authorNotes := cfg.AuthorNotes
	if story.AuthorNotes != "" {
		authorNotes = story.AuthorNotes
	}

	// Convert characters to JSON for the AI prompt
	var charsJSON string
	if len(story.Characters) > 0 {
		if b, err := jsonMarshalChars(story.Characters); err == nil {
			charsJSON = string(b)
		}
	}

	extra := ai.StoryContext{
		AIInstructions: aiInstructions,
		AuthorNotes:    authorNotes,
		StoryOutline:   story.StoryOutline,
		Characters:     charsJSON,
		NSFW:           story.NSFW,
	}

	go func() {
		_, err := client.Chat(a.ctx, story.Title, story.Genre, story.Synopsis, aiHistory, userMessage, mode, extra,
			func(token string) {
				runtime.EventsEmit(a.ctx, "chat:token", token)
			},
		)
		if err != nil {
			runtime.EventsEmit(a.ctx, "chat:error", err.Error())
			return
		}
		runtime.EventsEmit(a.ctx, "chat:done", nil)
	}()
}

// --- ComfyUI image generation ---

type ComfyConfig struct {
	URL            string  `json:"url"`
	Model          string  `json:"model"`
	Steps          int     `json:"steps"`
	CFG            float64 `json:"cfg"`
	Width          int     `json:"width"`
	Height         int     `json:"height"`
	NegativePrompt string  `json:"negativePrompt"`
	WorkflowPath   string  `json:"workflowPath"`
	PositiveNodeID string  `json:"positiveNodeID"`
}

func (a *App) comfyConfigPath() string {
	dir, _ := os.UserConfigDir()
	return filepath.Join(dir, "Plotter", "comfy_config.json")
}

func (a *App) GetComfyConfig() ComfyConfig {
	data, err := os.ReadFile(a.comfyConfigPath())
	cfg := ComfyConfig{URL: "http://127.0.0.1:8000", Steps: 20, CFG: 7, Width: 512, Height: 768, NegativePrompt: "ugly, blurry, bad anatomy, watermark, text"}
	if err == nil {
		_ = json.Unmarshal(data, &cfg)
	}
	if cfg.URL == "" {
		cfg.URL = "http://127.0.0.1:8000"
	}
	if cfg.Steps == 0 {
		cfg.Steps = 20
	}
	if cfg.CFG == 0 {
		cfg.CFG = 7
	}
	if cfg.Width == 0 {
		cfg.Width = 512
	}
	if cfg.Height == 0 {
		cfg.Height = 768
	}
	return cfg
}

func (a *App) SaveComfyConfig(url, model, negativePrompt, workflowPath, positiveNodeID string, steps, width, height int, cfg float64) error {
	c := ComfyConfig{URL: url, Model: model, NegativePrompt: negativePrompt, Steps: steps, CFG: cfg, Width: width, Height: height, WorkflowPath: workflowPath, PositiveNodeID: positiveNodeID}
	data, _ := json.MarshalIndent(c, "", "  ")
	return os.WriteFile(a.comfyConfigPath(), data, 0644)
}

func (a *App) BrowseWorkflowFile() (string, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select ComfyUI Workflow (API format)",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON Workflow (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil || path == "" {
		return "", nil
	}
	return path, nil
}

func (a *App) CheckComfyUI() bool {
	cfg := a.GetComfyConfig()
	resp, err := http.Get(cfg.URL + "/system_stats")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == 200
}

func (a *App) GetComfyModels() ([]string, error) {
	cfg := a.GetComfyConfig()
	resp, err := http.Get(cfg.URL + "/object_info/CheckpointLoaderSimple")
	if err != nil {
		return nil, fmt.Errorf("ComfyUI not reachable: %w", err)
	}
	defer resp.Body.Close()

	var info map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, err
	}

	node, _ := info["CheckpointLoaderSimple"].(map[string]interface{})
	input, _ := node["input"].(map[string]interface{})
	required, _ := input["required"].(map[string]interface{})
	ckptName, _ := required["ckpt_name"].([]interface{})
	if len(ckptName) == 0 {
		return nil, nil
	}
	list, _ := ckptName[0].([]interface{})
	result := make([]string, 0, len(list))
	for _, m := range list {
		if s, ok := m.(string); ok {
			result = append(result, s)
		}
	}
	return result, nil
}

func (a *App) GenerateImage(storyID, prompt string) (string, error) {
	cfg := a.GetComfyConfig()

	var workflow map[string]interface{}

	if cfg.WorkflowPath != "" {
		// Load saved workflow from file
		data, err := os.ReadFile(cfg.WorkflowPath)
		if err != nil {
			return "", fmt.Errorf("failed to read workflow file: %w", err)
		}
		if err := json.Unmarshal(data, &workflow); err != nil {
			return "", fmt.Errorf("invalid workflow JSON: %w", err)
		}

		// Detect UI-format workflow (has a "nodes" array) vs API format
		if _, isUIFormat := workflow["nodes"]; isUIFormat {
			return "", fmt.Errorf(
				"workflow is in UI format, not API format.\n\n" +
					"To get the API format:\n" +
					"1. Open ComfyUI in your browser\n" +
					"2. Click the Settings gear icon (bottom-right)\n" +
					"3. Enable \"Dev Mode Options\"\n" +
					"4. Reload the page — a new \"Save (API Format)\" option will appear in the menu\n" +
					"5. Save and load that file here instead",
			)
		}

		// Find the positive prompt node
		nodeID := cfg.PositiveNodeID
		if nodeID == "" {
			for id, node := range workflow {
				nodeMap, ok := node.(map[string]interface{})
				if !ok {
					continue
				}
				if nodeMap["class_type"] == "CLIPTextEncode" {
					nodeID = id
					break
				}
			}
		}
		if nodeID == "" {
			return "", fmt.Errorf("no CLIPTextEncode node found in workflow — specify a Positive Node ID in Settings")
		}

		nodeMap, ok := workflow[nodeID].(map[string]interface{})
		if !ok {
			return "", fmt.Errorf("node %q not found in workflow", nodeID)
		}
		inputs, ok := nodeMap["inputs"].(map[string]interface{})
		if !ok {
			return "", fmt.Errorf("node %q has no inputs", nodeID)
		}
		inputs["text"] = prompt
	} else {
		if cfg.Model == "" {
			return "", fmt.Errorf("no ComfyUI model selected — configure one in Settings")
		}
		seed := time.Now().UnixNano() % 9999999999
		workflow = map[string]interface{}{
			"3": map[string]interface{}{"class_type": "KSampler", "inputs": map[string]interface{}{
				"seed": seed, "steps": cfg.Steps, "cfg": cfg.CFG,
				"sampler_name": "euler", "scheduler": "normal", "denoise": 1,
				"model": []interface{}{"4", 0}, "positive": []interface{}{"6", 0},
				"negative": []interface{}{"7", 0}, "latent_image": []interface{}{"5", 0},
			}},
			"4": map[string]interface{}{"class_type": "CheckpointLoaderSimple", "inputs": map[string]interface{}{"ckpt_name": cfg.Model}},
			"5": map[string]interface{}{"class_type": "EmptyLatentImage", "inputs": map[string]interface{}{"width": cfg.Width, "height": cfg.Height, "batch_size": 1}},
			"6": map[string]interface{}{"class_type": "CLIPTextEncode", "inputs": map[string]interface{}{"text": prompt, "clip": []interface{}{"4", 1}}},
			"7": map[string]interface{}{"class_type": "CLIPTextEncode", "inputs": map[string]interface{}{"text": cfg.NegativePrompt, "clip": []interface{}{"4", 1}}},
			"8": map[string]interface{}{"class_type": "VAEDecode", "inputs": map[string]interface{}{"samples": []interface{}{"3", 0}, "vae": []interface{}{"4", 2}}},
			"9": map[string]interface{}{"class_type": "SaveImage", "inputs": map[string]interface{}{"filename_prefix": "plotter", "images": []interface{}{"8", 0}}},
		}
	}

	body, _ := json.Marshal(map[string]interface{}{"prompt": workflow})
	resp, err := http.Post(cfg.URL+"/prompt", "application/json", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("ComfyUI not reachable: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", err
	}

	promptID, _ := result["prompt_id"].(string)
	if promptID == "" {
		// Surface ComfyUI's error details if present
		if errDetail, ok := result["error"].(map[string]interface{}); ok {
			msg, _ := errDetail["message"].(string)
			details, _ := errDetail["details"].(string)
			if details != "" {
				return "", fmt.Errorf("ComfyUI error: %s — %s", msg, details)
			}
			return "", fmt.Errorf("ComfyUI error: %s", msg)
		}
		if errStr, ok := result["error"].(string); ok {
			return "", fmt.Errorf("ComfyUI error: %s", errStr)
		}
		return "", fmt.Errorf("ComfyUI returned no prompt_id (status %d): %s", resp.StatusCode, string(respBody))
	}

	for i := 0; i < 120; i++ {
		time.Sleep(time.Second)
		histResp, err := http.Get(cfg.URL + "/history/" + promptID)
		if err != nil {
			continue
		}
		var hist map[string]interface{}
		_ = json.NewDecoder(histResp.Body).Decode(&hist)
		histResp.Body.Close()

		entry, ok := hist[promptID].(map[string]interface{})
		if !ok {
			continue
		}
		outputs, ok := entry["outputs"].(map[string]interface{})
		if !ok {
			continue
		}

		for _, nodeOut := range outputs {
			nodeMap, _ := nodeOut.(map[string]interface{})
			images, _ := nodeMap["images"].([]interface{})
			if len(images) == 0 {
				continue
			}
			img, _ := images[0].(map[string]interface{})
			filename, _ := img["filename"].(string)
			subfolder, _ := img["subfolder"].(string)
			imgType, _ := img["type"].(string)

			imgResp, err := http.Get(fmt.Sprintf("%s/view?filename=%s&subfolder=%s&type=%s", cfg.URL, filename, subfolder, imgType))
			if err != nil {
				return "", err
			}
			defer imgResp.Body.Close()
			imgData, err := io.ReadAll(imgResp.Body)
			if err != nil {
				return "", err
			}
			return "data:image/png;base64," + base64.StdEncoding.EncodeToString(imgData), nil
		}
	}
	return "", fmt.Errorf("image generation timed out")
}

func (a *App) GenerateStoryIdea(genre string) (string, error) {
	if a.aiClient == nil {
		return "", nil
	}
	return a.aiClient.GenerateStoryIdea(a.ctx, genre)
}
