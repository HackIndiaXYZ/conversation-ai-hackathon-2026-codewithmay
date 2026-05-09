import React from 'react';
import { Video, VideoOff, Monitor, Settings, Mic, MicOff } from 'lucide-react';

/**
 * Control Bar Component
 * Bottom control buttons for camera, screen share, mic, settings
 */
const ControlBar = ({
  isCameraOn,
  onToggleCamera,
  isScreenSharing,
  onToggleScreenShare,
  isMicOn,
  onToggleMic,
  onOpenSettings
}) => {
  const buttonClass = (isActive) => `
    p-4 rounded-xl transition-all transform hover:scale-105
    ${isActive 
      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/50' 
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
    }
  `;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-3 bg-gray-900/90 backdrop-blur-md rounded-2xl p-3 border border-gray-800 shadow-2xl">
        {/* Camera toggle */}
        <button
          onClick={onToggleCamera}
          className={buttonClass(isCameraOn)}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen share toggle */}
        <button
          onClick={onToggleScreenShare}
          className={buttonClass(isScreenSharing)}
          title={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Mic toggle */}
        <button
          onClick={onToggleMic}
          className={buttonClass(isMicOn)}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={buttonClass(false)}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ControlBar;
