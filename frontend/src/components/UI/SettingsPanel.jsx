import React, { useState, useEffect } from 'react';
import { X, Volume2, Mic, Video, Monitor, Save, Bot, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_SETTINGS = {
  voiceEnabled: true,
  autoPlayAudio: true,
  avatarAnimations: true,
  speechSpeed: 1.0,
  speechPitch: 1.05,
  speechVolume: 1.0,
  selectedVoiceURI: '',
  micVolume: 1.0,
  cameraQuality: 'high',
  theme: 'dark',
  // Avatar Persona config
  personaName: '',
  personaRole: '',
  personaTraits: '',
  personaSystemPrompt: '',
  personaDialogueBehavior: '',
};

export function loadSettings() {
  try {
    const saved = localStorage.getItem('ai-avatar-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

const SettingsPanel = ({ isOpen, onClose, availableVoices = [], onSettingsChange }) => {
  const [settings, setSettings] = useState(loadSettings);
  const [personaExpanded, setPersonaExpanded] = useState(false);

  // Sync from storage when panel opens
  useEffect(() => {
    if (isOpen) setSettings(loadSettings());
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('ai-avatar-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
    onClose();
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  // Group voices for display
  const enVoices = availableVoices.filter(v => v.lang.startsWith('en'));
  const otherVoices = availableVoices.filter(v => !v.lang.startsWith('en'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">

          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary-500" />
              Voice Settings
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Enable Voice Output</span>
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) => updateSetting('voiceEnabled', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-gray-300">Auto-play Audio Responses</span>
                <input
                  type="checkbox"
                  checked={settings.autoPlayAudio}
                  onChange={(e) => updateSetting('autoPlayAudio', e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-600 focus:ring-primary-500"
                />
              </label>

              {/* Voice selector */}
              <div>
                <label className="text-gray-300 block mb-2">Voice</label>
                <select
                  value={settings.selectedVoiceURI}
                  onChange={(e) => updateSetting('selectedVoiceURI', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— Auto (recommended female) —</option>
                  {enVoices.length > 0 && (
                    <optgroup label="English Voices">
                      {enVoices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang}){v.localService ? ' ✓' : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {otherVoices.length > 0 && (
                    <optgroup label="Other Languages">
                      {otherVoices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {availableVoices.length === 0 && (
                    <option disabled>Loading voices…</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">✓ = local (offline) voice</p>
              </div>

              {/* Speech speed */}
              <div>
                <label className="text-gray-300 block mb-2">
                  Speech Speed: {settings.speechSpeed.toFixed(1)}x
                </label>
                <input
                  type="range" min="0.5" max="2.0" step="0.1"
                  value={settings.speechSpeed}
                  onChange={(e) => updateSetting('speechSpeed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5× Slow</span><span>1.0× Normal</span><span>2.0× Fast</span>
                </div>
              </div>

              {/* Pitch */}
              <div>
                <label className="text-gray-300 block mb-2">
                  Pitch: {settings.speechPitch.toFixed(2)}
                </label>
                <input
                  type="range" min="0.5" max="2.0" step="0.05"
                  value={settings.speechPitch}
                  onChange={(e) => updateSetting('speechPitch', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span><span>Normal</span><span>High</span>
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="text-gray-300 block mb-2">
                  Voice Volume: {Math.round(settings.speechVolume * 100)}%
                </label>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={settings.speechVolume}
                  onChange={(e) => updateSetting('speechVolume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Microphone Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary-500" />
              Microphone Settings
            </h3>
            <div>
              <label className="text-gray-300 block mb-2">
                Microphone Volume: {Math.round(settings.micVolume * 100)}%
              </label>
              <input
                type="range" min="0" max="1" step="0.1"
                value={settings.micVolume}
                onChange={(e) => updateSetting('micVolume', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Avatar Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-primary-500" />
              Avatar Settings
            </h3>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Enable Avatar Animations</span>
              <input
                type="checkbox"
                checked={settings.avatarAnimations}
                onChange={(e) => updateSetting('avatarAnimations', e.target.checked)}
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Camera Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary-500" />
              Camera Settings
            </h3>
            <div>
              <label className="text-gray-300 block mb-2">Camera Quality</label>
              <select
                value={settings.cameraQuality}
                onChange={(e) => updateSetting('cameraQuality', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low (480p)</option>
                <option value="medium">Medium (720p)</option>
                <option value="high">High (1080p)</option>
              </select>
            </div>
          </div>

          {/* Avatar Persona Configuration */}
          <div className="space-y-4">
            <button
              onClick={() => setPersonaExpanded(p => !p)}
              className="w-full flex items-center justify-between text-lg font-medium text-white"
            >
              <span className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-500" />
                Avatar Persona
              </span>
              {personaExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {personaExpanded && (
              <div className="space-y-4 pl-1">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Override the active persona's identity. Leave fields blank to use the default persona settings. A custom system prompt takes full control — use the fields above it for quick overrides instead.
                </p>

                {/* Name */}
                <div>
                  <label className="text-gray-300 block mb-1 text-sm">Avatar Name</label>
                  <input
                    type="text"
                    value={settings.personaName}
                    onChange={(e) => updateSetting('personaName', e.target.value)}
                    placeholder="e.g. Dr. Maya, Alex, Nova…"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm placeholder-gray-600"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-gray-300 block mb-1 text-sm">Role / Title</label>
                  <input
                    type="text"
                    value={settings.personaRole}
                    onChange={(e) => updateSetting('personaRole', e.target.value)}
                    placeholder="e.g. Sales Coach, Study Buddy, Customer Support…"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm placeholder-gray-600"
                  />
                </div>

                {/* Personality Traits */}
                <div>
                  <label className="text-gray-300 block mb-1 text-sm">Personality Traits</label>
                  <input
                    type="text"
                    value={settings.personaTraits}
                    onChange={(e) => updateSetting('personaTraits', e.target.value)}
                    placeholder="e.g. friendly, concise, encouraging, humorous…"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm placeholder-gray-600"
                  />
                  <p className="text-xs text-gray-600 mt-1">Comma-separated traits that shape the avatar's tone</p>
                </div>

                {/* Dialogue Behavior */}
                <div>
                  <label className="text-gray-300 block mb-1 text-sm">Dialogue Behavior</label>
                  <select
                    value={settings.personaDialogueBehavior}
                    onChange={(e) => updateSetting('personaDialogueBehavior', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">— Default (per persona) —</option>
                    <option value="concise">Concise — short replies, max 2 sentences</option>
                    <option value="detailed">Detailed — thorough explanations</option>
                    <option value="socratic">Socratic — reply with guiding questions</option>
                    <option value="empathetic">Empathetic — acknowledge feelings first</option>
                    <option value="formal">Formal — professional, no contractions</option>
                    <option value="casual">Casual — relaxed, conversational</option>
                  </select>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="text-gray-300 block mb-1 text-sm">
                    Custom System Prompt
                    <span className="ml-2 text-xs text-yellow-500 font-normal">⚡ Overrides everything above</span>
                  </label>
                  <textarea
                    rows={5}
                    value={settings.personaSystemPrompt}
                    onChange={(e) => updateSetting('personaSystemPrompt', e.target.value)}
                    placeholder={"You are [Name], a [role] with [X] years of experience. Your personality is [traits]. Always respond in [style]. Keep responses under [N] sentences."}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono placeholder-gray-600 resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Full system prompt that replaces the persona's default. Leave blank to build from the fields above.
                  </p>
                </div>

                {/* Reset persona config */}
                {(settings.personaName || settings.personaRole || settings.personaTraits || settings.personaSystemPrompt || settings.personaDialogueBehavior) && (
                  <button
                    onClick={() => {
                      updateSetting('personaName', '');
                      updateSetting('personaRole', '');
                      updateSetting('personaTraits', '');
                      updateSetting('personaSystemPrompt', '');
                      updateSetting('personaDialogueBehavior', '');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕ Clear persona overrides
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Appearance</h3>
            <div>
              <label className="text-gray-300 block mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light (Coming Soon)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
