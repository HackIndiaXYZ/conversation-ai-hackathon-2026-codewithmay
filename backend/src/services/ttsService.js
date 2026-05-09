import axios from 'axios';

class TTSService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_TTS_API_KEY;
  }

  /**
   * Google Cloud TTS voice names per persona voice type.
   * All are female Neural2 voices for natural sound.
   */
  getGoogleVoice(voiceType) {
    const voices = {
      professional: { languageCode: 'en-US', name: 'en-US-Neural2-F' }, // Pharmacist Haru - clear, precise
      friendly:     { languageCode: 'en-US', name: 'en-US-Neural2-C' }, // Nurse Izumi - warm, approachable
      warm:         { languageCode: 'en-US', name: 'en-US-Neural2-E' }, // Dietitian - gentle, nurturing
      calm:         { languageCode: 'en-US', name: 'en-US-Neural2-H' }, // Psychologist - soothing, measured
    };
    return voices[voiceType] || voices['friendly'];
  }

  /**
   * Speaking rate per voice type for natural character feel
   */
  getSpeakingRate(voiceType) {
    const rates = {
      professional: 1.05, // Pharmacist: slightly brisk, confident
      friendly:     1.0,  // Nurse: natural pace
      warm:         0.95, // Dietitian: relaxed
      calm:         0.9,  // Psychologist: slow and measured
    };
    return rates[voiceType] || 1.0;
  }

  async generateSpeech(text, voiceType = 'friendly') {
    if (!text?.trim()) return null;

    if (this.googleApiKey) {
      return this.googleTTS(text, voiceType);
    }

    // Fallback: browser Web Speech API (handled client-side)
    return null;
  }

  async googleTTS(text, voiceType) {
    try {
      const voice = this.getGoogleVoice(voiceType);
      const speakingRate = this.getSpeakingRate(voiceType);

      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.googleApiKey}`,
        {
          input: { text },
          voice: {
            languageCode: voice.languageCode,
            name: voice.name,
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
            pitch: 0.0,
            volumeGainDb: 1.0,
            effectsProfileId: ['headphone-class-device'],
          },
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const audioContent = response.data?.audioContent;
      if (!audioContent) return null;

      return {
        audioData: audioContent, // Already base64 from Google
        mimeType: 'audio/mpeg',
      };
    } catch (error) {
      console.error('Google TTS error:', error.response?.data || error.message);
      return null;
    }
  }
}

export default new TTSService();
