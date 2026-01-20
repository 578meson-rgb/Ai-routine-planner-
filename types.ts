
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface SelectedChapter {
  subject: string;
  paper: string;
  chapterName: string;
}

export interface StudyRequest {
  selectedChapters: SelectedChapter[];
  examDate: string;
  dailyHours: number;
  confidence: ConfidenceLevel;
}

export interface SyllabusItem {
  name: string;
  icon: string;
  papers: {
    [key: string]: string[];
  };
}
