package main

import "testing"

func TestSelectPrimaryModel(t *testing.T) {
	cfg := BootstrapConfig{
		QwenModel:        "qwen3.5:latest",
		LlamaModel:       "llama4:latest",
		MinRAMForLlamaGB: 16,
		MinVRAMForLlama:  8,
	}

	tests := []struct {
		name string
		hw   HardwareProfile
		want string
	}{
		{
			name: "low spec chooses qwen",
			hw: HardwareProfile{
				TotalRAMGB: 8,
				HasGPU:     false,
				GPUVRAMGB:  0,
			},
			want: cfg.QwenModel,
		},
		{
			name: "high spec with gpu chooses llama",
			hw: HardwareProfile{
				TotalRAMGB: 32,
				HasGPU:     true,
				GPUVRAMGB:  12,
			},
			want: cfg.LlamaModel,
		},
		{
			name: "high ram cpu only chooses llama",
			hw: HardwareProfile{
				TotalRAMGB: 32,
				HasGPU:     false,
				GPUVRAMGB:  0,
			},
			want: cfg.LlamaModel,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := selectPrimaryModel(tt.hw, cfg)
			if got != tt.want {
				t.Fatalf("selectPrimaryModel() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestOrderedModelCandidates(t *testing.T) {
	cfg := BootstrapConfig{QwenModel: "qwen3.5:latest", LlamaModel: "llama4:latest"}

	tests := []struct {
		name    string
		primary string
		want    []string
	}{
		{
			name:    "llama primary then qwen fallback",
			primary: cfg.LlamaModel,
			want:    []string{cfg.LlamaModel, cfg.QwenModel},
		},
		{
			name:    "qwen primary then llama fallback",
			primary: cfg.QwenModel,
			want:    []string{cfg.QwenModel, cfg.LlamaModel},
		},
		{
			name:    "unknown primary defaults to qwen then llama",
			primary: "unknown",
			want:    []string{cfg.QwenModel, cfg.LlamaModel},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := orderedModelCandidates(tt.primary, cfg)
			if len(got) != len(tt.want) {
				t.Fatalf("orderedModelCandidates() length=%d, want=%d", len(got), len(tt.want))
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Fatalf("orderedModelCandidates()[%d] = %q, want %q", i, got[i], tt.want[i])
				}
			}
		})
	}
}
