
import React from 'react';

export enum Language {
  TAMIL = 'Tamil',
  ENGLISH = 'English',
  HINDI = 'Hindi',
  MALAYALAM = 'Malayalam',
  TELUGU = 'Telugu'
}

export enum Classification {
  AI_GENERATED = 'AI_GENERATED',
  HUMAN = 'HUMAN'
}

export interface VoiceAnalysisResponse {
  status: 'success' | 'error';
  language?: string;
  classification?: Classification;
  confidenceScore?: number;
  explanation?: string;
  message?: string; // For errors
}

export interface ApiRequestPayload {
  language: Language;
  audioFormat: 'mp3';
  audioBase64: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface TestCase {
  id: number;
  language: Language;
  expectedType: Classification;
  audioFile: File | null;
  status: 'idle' | 'running' | 'completed' | 'error';
  result: VoiceAnalysisResponse | null;
}
