package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/ollama"
)

// thinkTagRe strips Qwen-style <think>...</think> chain-of-thought blocks.
var thinkTagRe = regexp.MustCompile(`(?s)<think>.*?</think>`)

type Client struct {
	llm   *ollama.LLM
	model string
}

// Message is the history format passed from the frontend.
type Message struct {
	Role    string // "narrator" or "player"
	Mode    string // "act" or "speak" (only for player messages)
	Content string
}

// StoryContext carries per-story prompt customisation fields.
type StoryContext struct {
	AIInstructions string
	AuthorNotes    string
	StoryOutline   string
	Characters     string // JSON: [{name,description}]
	NSFW           bool
}

func NewClient(model string) (*Client, error) {
	if model == "" {
		model = "qwen3.5:latest"
	}
	llm, err := ollama.New(ollama.WithModel(model))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ollama: %w", err)
	}
	return &Client{llm: llm, model: model}, nil
}

// Chat runs one conversational turn. onToken is called for each streamed chunk;
// pass nil to collect the full response without streaming.
func (c *Client) Chat(ctx context.Context, storyTitle, genre, synopsis string, history []Message, userMessage, mode string, extra StoryContext, onToken func(string)) (string, error) {
	system := buildSystemPrompt(storyTitle, genre, synopsis, extra)

	msgs := []llms.MessageContent{
		llms.TextParts(llms.ChatMessageTypeSystem, system),
	}
	for _, m := range history {
		if m.Role == "narrator" {
			msgs = append(msgs, llms.TextParts(llms.ChatMessageTypeAI, m.Content))
		} else {
			msgs = append(msgs, llms.TextParts(llms.ChatMessageTypeHuman, formatPlayerMessage(m.Content, m.Mode)))
		}
	}
	msgs = append(msgs, llms.TextParts(llms.ChatMessageTypeHuman, formatPlayerMessage(userMessage, mode)))

	maxTokens := 300
	if isThinkingModel(c.model) {
		maxTokens = 4000
	}

	var buf strings.Builder
	opts := []llms.CallOption{
		llms.WithMaxTokens(maxTokens),
		llms.WithTemperature(0.85),
		llms.WithStreamingFunc(func(_ context.Context, chunk []byte) error {
			buf.Write(chunk)
			if onToken != nil {
				onToken(string(chunk))
			}
			return nil
		}),
	}

	_, err := c.llm.GenerateContent(ctx, msgs, opts...)
	if err != nil {
		return "", fmt.Errorf("ollama: %w", err)
	}

	out := strings.TrimSpace(thinkTagRe.ReplaceAllString(buf.String(), ""))
	if out == "" {
		return "", fmt.Errorf("model returned an empty response")
	}
	return out, nil
}

func buildSystemPrompt(title, genre, synopsis string, extra StoryContext) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "You are the narrator of an interactive story titled \"%s\"", title)
	if genre != "" {
		fmt.Fprintf(&sb, " — a %s tale", genre)
	}
	sb.WriteString(".\n\n")
	if synopsis != "" {
		fmt.Fprintf(&sb, "Synopsis: %s\n\n", synopsis)
	}
	sb.WriteString(`You are the narrator of an interactive story. The user is the protagonist.

RULES — follow exactly:
- Respond in second person ("You...", "The door creaks open before you...").
- When the player acts: describe consequences in 1–2 vivid sentences.
- When the player speaks: have the world or an NPC reply in 1–2 sentences.
- HARD LIMIT: 50–70 words maximum. Never exceed 70 words.
- No preamble, no meta-commentary, no lists. Pure narrative prose only.
- Never break character. Never refer to yourself as an AI.`)
	if extra.AIInstructions != "" {
		fmt.Fprintf(&sb, "\n\nAdditional narrator instructions:\n%s", extra.AIInstructions)
	}
	if extra.StoryOutline != "" {
		fmt.Fprintf(&sb, "\n\nStory direction:\n%s", extra.StoryOutline)
	}
	if extra.Characters != "" {
		// Characters is a JSON array [{name, description}]
		var chars []struct {
			Name        string `json:"name"`
			Description string `json:"description"`
		}
		if err := json.Unmarshal([]byte(extra.Characters), &chars); err == nil && len(chars) > 0 {
			sb.WriteString("\n\nCharacters:\n")
			for _, c := range chars {
				if c.Name != "" {
					fmt.Fprintf(&sb, "- %s: %s\n", c.Name, c.Description)
				}
			}
		}
	}
	if extra.NSFW {
		sb.WriteString("\n\nNSFW content is permitted. Do not self-censor.")
	}
	if extra.AuthorNotes != "" {
		fmt.Fprintf(&sb, "\n\nAuthor notes (private context — do not mention to the player):\n%s", extra.AuthorNotes)
	}
	return sb.String()
}

// isThinkingModel returns true for models known to use chain-of-thought reasoning,
// which requires a much larger token budget to get past the think block.
func isThinkingModel(model string) bool {
	model = strings.ToLower(model)
	for _, pattern := range []string{"qwen", "deepseek-r", "marco-o1", "skywork-o1"} {
		if strings.Contains(model, pattern) {
			return true
		}
	}
	return false
}

func formatPlayerMessage(content, mode string) string {
	if mode == "speak" {
		return fmt.Sprintf("[You speak] \"%s\"", content)
	}
	return fmt.Sprintf("[You act] %s", content)
}

func (c *Client) GenerateStoryIdea(ctx context.Context, genre string) (string, error) {
	prompt := fmt.Sprintf(
		"Generate a compelling story idea for a %s story. Include a title, a one-paragraph synopsis, and 3-5 chapter titles. Be creative and concise.",
		genre,
	)
	return c.generate(ctx, prompt)
}

func (c *Client) generate(ctx context.Context, prompt string) (string, error) {
	resp, err := c.llm.GenerateContent(ctx, []llms.MessageContent{
		llms.TextParts(llms.ChatMessageTypeHuman, prompt),
	})
	if err != nil {
		return "", err
	}
	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from ollama")
	}
	return resp.Choices[0].Content, nil
}
