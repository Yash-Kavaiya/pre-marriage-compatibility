import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Question, importanceLabels, flexibilityLabels } from "@/data/assessmentQuestions";

interface QuestionCardProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  importanceValue: number;
  flexibilityValue: number;
  onImportanceChange: (value: number) => void;
  onFlexibilityChange: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const RatingScale = ({ 
  title, 
  value, 
  onChange, 
  labels, 
  color 
}: { 
  title: string; 
  value: number; 
  onChange: (value: number) => void; 
  labels: string[];
  color: string;
}) => {
  const isSelected = (index: number) => value === index + 1;
  const themeColor = color === 'primary' ? 'primary' : 'success';

  return (
    <div className="space-y-3 md:space-y-4">
      <h4 className="text-lg md:text-xl font-semibold text-primary font-dancing mb-2">♥ {title} ♥</h4>
      <div className="space-y-2 md:space-y-3">
        {labels.map((label, index) => (
          <button
            key={index}
            onClick={() => onChange(index + 1)}
            className={`rating-button ${isSelected(index) ? 'rating-button-selected' : ''} text-left`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs md:text-sm ${
                  isSelected(index) 
                    ? 'bg-white/20 border-white text-white' 
                    : `border-${themeColor}/30 text-${themeColor}`
                }`}>
                  {index + 1}
                </div>
                <span className={`font-medium text-sm md:text-base ${isSelected(index) ? 'text-white' : 'text-foreground'}`}>
                  {label}
                </span>
              </div>
              <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all flex-shrink-0 ${
                isSelected(index) 
                  ? 'bg-white border-white' 
                  : 'border-border'
              }`}>
                {isSelected(index) && (
                  <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-${themeColor} mx-auto mt-0.5 md:mt-0.5`} />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const QuestionCard = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  importanceValue,
  flexibilityValue,
  onImportanceChange,
  onFlexibilityChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious
}: QuestionCardProps) => {
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const bothAnswered = importanceValue > 0 && flexibilityValue > 0;

  // Auto-advance when both ratings are selected
  const handleImportanceChange = (value: number) => {
    onImportanceChange(value);
    // Auto-advance if flexibility is already selected
    if (flexibilityValue > 0) {
      setTimeout(() => {
        onNext();
      }, 500); // Small delay for user feedback
    }
  };

  const handleFlexibilityChange = (value: number) => {
    onFlexibilityChange(value);
    // Auto-advance if importance is already selected
    if (importanceValue > 0) {
      setTimeout(() => {
        onNext();
      }, 500); // Small delay for user feedback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-white to-feminine-light px-3 md:px-4 py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="mb-6 md:mb-10">
          <div className="text-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full gradient-romantic flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-premium animate-pulse">
              <span className="text-lg md:text-2xl text-white font-bold">💕</span>
            </div>
            <h1 className="text-2xl md:text-3xl romantic-heading mb-2 md:mb-3 px-4">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h1>
            <div className="inline-block px-3 py-1 md:px-4 md:py-2 gradient-romantic rounded-full shadow-soft">
              <p className="text-white font-medium text-base md:text-lg">{question.category}</p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-secondary/50 rounded-full p-1 shadow-soft">
              <Progress value={progressPercentage} className="h-2 md:h-3" />
            </div>
            <p className="text-muted-foreground text-center mt-2 md:mt-3 text-base md:text-lg font-medium">
              {Math.round(progressPercentage)}% Complete
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="card-premium p-6 md:p-10 mb-6 md:mb-8 mx-2 md:mx-0">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-3xl font-bold text-foreground leading-relaxed font-cormorant mb-3 md:mb-4 px-2">
              {question.question}
            </h2>
            {question.explanation && (
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-2">
                {question.explanation}
              </p>
            )}
          </div>
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-10">
            {/* Importance Rating */}
            <div className="space-y-6">
              <RatingScale
                title="Importance to Me"
                value={importanceValue}
                onChange={handleImportanceChange}
                labels={importanceLabels}
                color="primary"
              />
            </div>

            {/* Flexibility Rating */}
            <div className="space-y-6">
              <RatingScale
                title="My Flexibility Level"
                value={flexibilityValue}
                onChange={handleFlexibilityChange}
                labels={flexibilityLabels}
                color="success"
              />
            </div>
          </div>

          {/* Status & Navigation */}
          <div className="border-t border-border/20 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <Button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-base md:text-lg shadow-soft w-full md:w-auto"
                size="lg"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                Previous
              </Button>

              <div className="text-center order-first md:order-none">
                {!bothAnswered && (
                  <div className="px-4 py-2 md:px-6 md:py-3 bg-warning/10 rounded-full">
                    <p className="text-warning font-medium text-sm md:text-lg font-dancing">
                      💕 Select both ratings to continue
                    </p>
                  </div>
                )}
                {bothAnswered && (
                  <div className="px-4 py-2 md:px-6 md:py-3 gradient-romantic rounded-full shadow-soft">
                    <p className="text-white font-medium text-sm md:text-lg font-dancing">
                      💖 Auto-advancing to next question...
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={onNext}
                disabled={!bothAnswered}
                className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-base md:text-lg shadow-premium w-full md:w-auto ${
                  bothAnswered ? 'btn-primary' : ''
                }`}
                size="lg"
              >
                <span className="truncate">{currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;