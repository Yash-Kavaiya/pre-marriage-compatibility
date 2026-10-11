export interface AssessmentResponse {
  questionId: number;
  importance: number;
  flexibility: number;
}

export interface PartnerData {
  name: string;
  responses: AssessmentResponse[];
  completedAt: Date;
}
