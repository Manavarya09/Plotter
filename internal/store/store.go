package store

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// Character is a named figure in the story.
type Character struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Story is the persisted metadata for a single story.
// Status values: "" / "active" | "archived" | "complete"
type Story struct {
	ID             string      `json:"id"`
	Title          string      `json:"title"`
	Genre          string      `json:"genre"`
	Synopsis       string      `json:"synopsis"`
	Status         string      `json:"status"`
	CoverImage     string      `json:"coverImage"` // base64 data URL
	ActiveModel    string      `json:"activeModel"`
	NSFW           bool        `json:"nsfw"`
	AIInstructions string      `json:"aiInstructions"`
	AuthorNotes    string      `json:"authorNotes"`
	StoryOutline   string      `json:"storyOutline"`
	Characters     []Character `json:"characters"`
	CreatedAt      time.Time   `json:"createdAt"`
	UpdatedAt      time.Time   `json:"updatedAt"`
}

// Session is a saved chat exchange stored as a Markdown file.
type Session struct {
	ID        string    `json:"id"`
	StoryID   string    `json:"storyId"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
	Content   string    `json:"content"`
}

// UserTemplate is a user-created story template saved locally.
type UserTemplate struct {
	ID             string      `json:"id"`
	Name           string      `json:"name"`
	Genre          string      `json:"genre"`
	Tagline        string      `json:"tagline"`
	Description    string      `json:"description"`
	Moods          []string    `json:"moods"`
	Icon           string      `json:"icon"`
	NSFW           bool        `json:"nsfw"`
	Synopsis       string      `json:"synopsis"`
	AIInstructions string      `json:"aiInstructions"`
	AuthorNotes    string      `json:"authorNotes"`
	StoryOutline   string      `json:"storyOutline"`
	Characters     []Character `json:"characters"`
	CreatedAt      time.Time   `json:"createdAt"`
}

// Store manages all flat-file persistence.
type Store struct {
	root string // e.g. %APPDATA%/Plotter
}

// New creates a Store rooted at the Plotter config directory.
func New() (*Store, error) {
	base, err := os.UserConfigDir()
	if err != nil {
		return nil, fmt.Errorf("store: cannot locate config dir: %w", err)
	}
	root := filepath.Join(base, "Plotter")
	if err := os.MkdirAll(filepath.Join(root, "stories"), 0755); err != nil {
		return nil, fmt.Errorf("store: cannot create stories dir: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(root, "templates"), 0755); err != nil {
		return nil, fmt.Errorf("store: cannot create templates dir: %w", err)
	}
	return &Store{root: root}, nil
}

// storyDir returns the directory for a given story ID.
func (s *Store) storyDir(id string) string {
	return filepath.Join(s.root, "stories", id)
}

// metaPath returns the path to a story's meta.json.
func (s *Store) metaPath(id string) string {
	return filepath.Join(s.storyDir(id), "meta.json")
}

// sessionsDir returns the directory where session files are stored.
func (s *Store) sessionsDir(storyID string) string {
	return filepath.Join(s.storyDir(storyID), "sessions")
}

// --- Stories ---

func (s *Store) GetStories() ([]Story, error) {
	entries, err := os.ReadDir(filepath.Join(s.root, "stories"))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var stories []Story
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		story, err := s.GetStory(e.Name())
		if err != nil {
			continue // skip corrupted entries
		}
		stories = append(stories, story)
	}
	// Sort newest first
	sort.Slice(stories, func(i, j int) bool {
		return stories[i].CreatedAt.After(stories[j].CreatedAt)
	})
	return stories, nil
}

func (s *Store) GetStory(id string) (Story, error) {
	data, err := os.ReadFile(s.metaPath(id))
	if err != nil {
		return Story{}, fmt.Errorf("story %s not found: %w", id, err)
	}
	var story Story
	if err := json.Unmarshal(data, &story); err != nil {
		return Story{}, fmt.Errorf("story %s corrupted: %w", id, err)
	}
	return story, nil
}

func (s *Store) CreateStory(title, genre, synopsis string) (Story, error) {
	id := strconv.FormatInt(time.Now().UnixMilli(), 10)
	now := time.Now()
	story := Story{
		ID:         id,
		Title:      title,
		Genre:      genre,
		Synopsis:   synopsis,
		Characters: []Character{},
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := s.writeStory(story); err != nil {
		return Story{}, err
	}
	return story, nil
}

func (s *Store) UpdateStory(id, title, genre, synopsis string) (Story, error) {
	story, err := s.GetStory(id)
	if err != nil {
		return Story{}, err
	}
	story.Title = title
	story.Genre = genre
	story.Synopsis = synopsis
	story.UpdatedAt = time.Now()
	if err := s.writeStory(story); err != nil {
		return Story{}, err
	}
	return story, nil
}

func (s *Store) DeleteStory(id string) error {
	return os.RemoveAll(s.storyDir(id))
}

func (s *Store) UpdateStoryCover(id, imageData string) (Story, error) {
	story, err := s.GetStory(id)
	if err != nil {
		return Story{}, err
	}
	story.CoverImage = imageData
	story.UpdatedAt = time.Now()
	if err := s.writeStory(story); err != nil {
		return Story{}, err
	}
	return story, nil
}

func (s *Store) UpdateStoryStatus(id, status string) (Story, error) {
	story, err := s.GetStory(id)
	if err != nil {
		return Story{}, err
	}
	story.Status = status
	story.UpdatedAt = time.Now()
	if err := s.writeStory(story); err != nil {
		return Story{}, err
	}
	return story, nil
}

func (s *Store) UpdateStorySettings(id, activeModel string, nsfw bool, aiInstructions, authorNotes, storyOutline string, characters []Character) (Story, error) {
	story, err := s.GetStory(id)
	if err != nil {
		return Story{}, err
	}
	story.ActiveModel = activeModel
	story.NSFW = nsfw
	story.AIInstructions = aiInstructions
	story.AuthorNotes = authorNotes
	story.StoryOutline = storyOutline
	story.Characters = characters
	story.UpdatedAt = time.Now()
	if err := s.writeStory(story); err != nil {
		return Story{}, err
	}
	return story, nil
}

func (s *Store) writeStory(story Story) error {
	dir := s.storyDir(story.ID)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("store: cannot create story dir: %w", err)
	}
	data, err := json.MarshalIndent(story, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.metaPath(story.ID), data, 0644)
}

// --- Sessions ---

func (s *Store) GetSessions(storyID string) ([]Session, error) {
	dir := s.sessionsDir(storyID)
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var sessions []Session
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		sessionID := strings.TrimSuffix(e.Name(), ".md")
		session, err := s.GetSession(storyID, sessionID)
		if err != nil {
			continue
		}
		sessions = append(sessions, session)
	}
	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].CreatedAt.After(sessions[j].CreatedAt)
	})
	return sessions, nil
}

func (s *Store) GetSession(storyID, sessionID string) (Session, error) {
	path := filepath.Join(s.sessionsDir(storyID), sessionID+".md")
	data, err := os.ReadFile(path)
	if err != nil {
		return Session{}, fmt.Errorf("session %s not found: %w", sessionID, err)
	}
	// Format: first line is "# {title}" (optional), rest is content.
	// We embed metadata in the filename (timestamp = ID = createdAt).
	content := string(data)
	title := sessionID
	if len(content) > 2 && content[:2] == "# " {
		end := strings.Index(content, "\n")
		if end == -1 {
			end = len(content)
		}
		title = strings.TrimSpace(content[2:end])
		if end < len(content) {
			content = strings.TrimSpace(content[end+1:])
		} else {
			content = ""
		}
	}

	// Parse timestamp from ID (milliseconds since epoch)
	var createdAt time.Time
	if ms, err := strconv.ParseInt(sessionID, 10, 64); err == nil {
		createdAt = time.UnixMilli(ms)
	} else {
		createdAt = time.Now()
	}

	return Session{
		ID:        sessionID,
		StoryID:   storyID,
		Title:     title,
		CreatedAt: createdAt,
		Content:   content,
	}, nil
}

func (s *Store) SaveSession(storyID, title, content string) (Session, error) {
	if err := os.MkdirAll(s.sessionsDir(storyID), 0755); err != nil {
		return Session{}, fmt.Errorf("store: cannot create sessions dir: %w", err)
	}
	id := strconv.FormatInt(time.Now().UnixMilli(), 10)
	md := fmt.Sprintf("# %s\n\n%s", title, content)
	path := filepath.Join(s.sessionsDir(storyID), id+".md")
	if err := os.WriteFile(path, []byte(md), 0644); err != nil {
		return Session{}, err
	}
	return Session{
		ID:        id,
		StoryID:   storyID,
		Title:     title,
		CreatedAt: time.Now(),
		Content:   content,
	}, nil
}

func (s *Store) DeleteSession(storyID, sessionID string) error {
	path := filepath.Join(s.sessionsDir(storyID), sessionID+".md")
	err := os.Remove(path)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}

// --- User Templates ---

func (s *Store) templatesDir() string {
	return filepath.Join(s.root, "templates")
}

func (s *Store) templatePath(id string) string {
	return filepath.Join(s.templatesDir(), id+".json")
}

func (s *Store) GetUserTemplates() ([]UserTemplate, error) {
	entries, err := os.ReadDir(s.templatesDir())
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var templates []UserTemplate
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		id := strings.TrimSuffix(e.Name(), ".json")
		data, err := os.ReadFile(s.templatePath(id))
		if err != nil {
			continue
		}
		var t UserTemplate
		if err := json.Unmarshal(data, &t); err != nil {
			continue
		}
		templates = append(templates, t)
	}
	sort.Slice(templates, func(i, j int) bool {
		return templates[i].CreatedAt.After(templates[j].CreatedAt)
	})
	return templates, nil
}

func (s *Store) CreateUserTemplate(name, genre, tagline, description string, moods []string, icon string, nsfw bool, synopsis, aiInstructions, authorNotes, storyOutline string, characters []Character) (UserTemplate, error) {
	id := strconv.FormatInt(time.Now().UnixMilli(), 10)
	t := UserTemplate{
		ID:             id,
		Name:           name,
		Genre:          genre,
		Tagline:        tagline,
		Description:    description,
		Moods:          moods,
		Icon:           icon,
		NSFW:           nsfw,
		Synopsis:       synopsis,
		AIInstructions: aiInstructions,
		AuthorNotes:    authorNotes,
		StoryOutline:   storyOutline,
		Characters:     characters,
		CreatedAt:      time.Now(),
	}
	if t.Moods == nil {
		t.Moods = []string{}
	}
	if t.Characters == nil {
		t.Characters = []Character{}
	}
	data, err := json.MarshalIndent(t, "", "  ")
	if err != nil {
		return UserTemplate{}, err
	}
	if err := os.WriteFile(s.templatePath(id), data, 0644); err != nil {
		return UserTemplate{}, err
	}
	return t, nil
}

func (s *Store) DeleteUserTemplate(id string) error {
	err := os.Remove(s.templatePath(id))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
