import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, AlertTriangle, Loader2 } from "lucide-react";
import CategoryIcon from '@/components/CategoryIcon';
import SiteHeader from '@/components/SiteHeader';
import { assessmentQuestions, flexibilityLabels, importanceLabels } from '@/data/assessmentQuestions';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface VoiceAssessmentProps {
  onComplete: (responses: { questionId: number; importance: number; flexibility: number; }[]) => void;
  onCancel: () => void;
  partnerName: string;
}

const VoiceShell = ({ onCancel, children }: { onCancel: () => void; children: React.ReactNode }) => (
  <div className="paper flex min-h-screen flex-col">
    <SiteHeader
      right={
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Exit
        </Button>
      }
    />
    <main className="container flex flex-1 items-center justify-center py-12">{children}</main>
  </div>
);

const ScaleHint = ({ labels, active, title }: { labels: string[]; active: boolean; title: string }) => (
  <div className={cn('rounded-lg border p-4 transition-colors', active ? 'border-primary bg-primary-soft' : 'border-border')}>
    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</p>
    <ol className="mt-2 space-y-0.5 text-sm text-muted-foreground">
      {labels.map((label, i) => (
        <li key={label}>
          <span className="mr-2 font-display text-base font-semibold text-foreground">{i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  </div>
);

const VoiceAssessment = ({ onComplete, onCancel, partnerName }: VoiceAssessmentProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{ questionId: number; importance: number; flexibility: number; }[]>([]);
  const [currentMode, setCurrentMode] = useState<'listening' | 'importance' | 'flexibility' | 'next'>('listening');
  const [isListening, setIsListening] = useState(false);
  const [currentResponse, setCurrentResponse] = useState({ importance: 0, flexibility: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const { toast } = useToast();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;

  useEffect(() => {
    checkPermissionsAndInitialize();
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      recognitionRef.current = new SpeechRecognitionCtor();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          const result = event.results[0][0].transcript;
          console.log('Voice recognition result:', result);
          handleVoiceResult(result);
        };
        
        recognitionRef.current.onerror = (error) => {
          console.error('Speech recognition error:', error);
          toast({
            title: "Voice Recognition Error",
            description: "Could not understand your response. Please try speaking again.",
            variant: "destructive",
          });
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current && currentQuestion && permissionGranted) {
      speakQuestion();
    }
  }, [currentQuestionIndex, permissionGranted]);

  const checkPermissionsAndInitialize = async () => {
    try {
      setIsInitializing(true);
      
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecure) {
        toast({
          title: "Secure Connection Required",
          description: "Voice features require HTTPS. Please use the secure version of this site.",
          variant: "destructive",
        });
        setIsInitializing(false);
        return;
      }

      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        setPermissionGranted(true);
        
        toast({
          title: "Voice Ready!",
          description: "Microphone access granted. You can now use voice features.",
        });
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError);
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access to use voice features.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing voice features:', error);
      toast({
        title: "Voice Initialization Failed",
        description: "Could not initialize voice features. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setSpeaking(false);
      toast({
        title: "Speech Error",
        description: "There was an issue with text-to-speech. Please try again.",
        variant: "destructive",
      });
    };
    
    synthRef.current.speak(utterance);
  };

  const speakQuestion = () => {
    if (currentMode === 'listening') {
      const questionText = `Question ${currentQuestionIndex + 1} of ${assessmentQuestions.length}. ${currentQuestion?.question}. Please rate how important this is to you from 1 to 5, where 1 is not important and 5 is extremely important.`;
      speak(questionText);
      setCurrentMode('importance');
    }
  };

  const handleVoiceResult = (result: string) => {
    const number = extractNumberFromSpeech(result);
    
    if (number >= 1 && number <= 5) {
      if (currentMode === 'importance') {
        setCurrentResponse(prev => ({ ...prev, importance: number }));
        setIsListening(false);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        const flexibilityText = `You rated importance as ${number}. Now, how much flexibility do you have on this topic? Rate from 1 to 5, where 1 is very flexible and 5 is non-negotiable.`;
        speak(flexibilityText);
        setCurrentMode('flexibility');
        
        setTimeout(() => {
          setIsListening(true);
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 3000);
        
      } else if (currentMode === 'flexibility') {
        const newResponse = { 
          questionId: currentQuestion.id, 
          importance: currentResponse.importance, 
          flexibility: number 
        };
        
        setResponses(prev => [...prev, newResponse]);
        setCurrentResponse({ importance: 0, flexibility: 0 });
        setIsListening(false);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        if (currentQuestionIndex < assessmentQuestions.length - 1) {
          const nextText = `Thank you. Moving to the next question.`;
          speak(nextText);
          
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentMode('listening');
          }, 2000);
        } else {
          speak("Assessment complete! Thank you for your responses.");
          setTimeout(() => {
            onComplete(responses.concat(newResponse));
          }, 2000);
        }
      }
    } else {
      speak("Please say a number from 1 to 5.");
    }
  };

  const extractNumberFromSpeech = (text: string): number => {
    const words = text.toLowerCase();
    const numberWords: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    };
    
    for (const word in numberWords) {
      if (words.includes(word)) {
        return numberWords[word];
      }
    }
    
    const numberMatch = text.match(/\d/);
    if (numberMatch) {
      const num = parseInt(numberMatch[0]);
      if (num >= 1 && num <= 5) return num;
    }
    
    return 0;
  };

  const startListening = async () => {
    if (!permissionGranted) {
      await checkPermissionsAndInitialize();
      return;
    }
    
    try {
      setIsListening(true);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Cannot Start Listening",
        description: "Please check your microphone permissions and try again.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleSpeaking = () => {
    if (speaking) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setSpeaking(false);
    } else {
      speakQuestion();
    }
  };

  const speechSupported = 'speechSynthesis' in window;
  const recognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (isInitializing) {
    return (
      <VoiceShell onCancel={onCancel}>
        <div className="surface max-w-md p-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h1 className="mt-5 text-3xl font-semibold text-primary">Preparing voice mode</h1>
          <p className="mt-2 text-sm text-muted-foreground">Setting up speech recognition and text-to-speech.</p>
        </div>
      </VoiceShell>
    );
  }

  if (!speechSupported || !recognitionSupported) {
    return (
      <VoiceShell onCancel={onCancel}>
        <div className="surface max-w-md p-10 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-priority" />
          <h1 className="mt-5 text-3xl font-semibold text-primary">Voice mode is not available here</h1>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {!speechSupported && <li>This browser does not support text-to-speech.</li>}
            {!recognitionSupported && <li>This browser does not support speech recognition.</li>}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">Chrome, Edge or Safari give the best voice experience.</p>
          <Button className="mt-6" onClick={onCancel}>
            Use the written assessment
          </Button>
        </div>
      </VoiceShell>
    );
  }

  if (!permissionGranted) {
    return (
      <VoiceShell onCancel={onCancel}>
        <div className="surface max-w-md p-10 text-center">
          <span className="icon-tile brand-gradient mx-auto h-16 w-16 rounded-2xl text-primary-foreground shadow-lg">
            <Mic className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold text-primary">Allow microphone access</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Voice mode needs your microphone to hear your ratings. Speech is handled by your browser and nothing is
            recorded or stored.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={checkPermissionsAndInitialize}>Allow microphone</Button>
            <Button onClick={onCancel} variant="ghost">
              Use the written assessment instead
            </Button>
          </div>
        </div>
      </VoiceShell>
    );
  }

  return (
    <VoiceShell onCancel={onCancel}>
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            <span className="eyebrow mr-2">Voice mode</span>
            {partnerName}
          </p>
          <p>
            Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
          </p>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
          <div className="brand-gradient h-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>

        <section key={currentQuestion?.id} className="surface mt-8 animate-fade-up p-6 md:p-10">
          {currentQuestion && (
            <p className="flex items-center gap-2.5">
              <CategoryIcon category={currentQuestion.category} size="sm" />
              <span className="eyebrow">{currentQuestion.category}</span>
            </p>
          )}
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{currentQuestion?.question}</h1>
          {currentQuestion?.explanation && (
            <p className="mt-3 text-muted-foreground">{currentQuestion.explanation}</p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ScaleHint title="Say your importance" labels={importanceLabels} active={currentMode === 'importance'} />
            <ScaleHint title="Then your flexibility" labels={flexibilityLabels} active={currentMode === 'flexibility'} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              aria-pressed={isListening}
              aria-label={isListening ? 'Stop listening' : 'Start speaking'}
              className={cn(
                'relative flex h-20 w-20 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-colors',
                isListening ? 'bg-priority' : 'brand-gradient hover:scale-105',
              )}
            >
              {isListening && <span className="absolute inset-0 animate-ping rounded-full bg-priority/30" />}
              {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isListening
                ? 'Listening... say a number from 1 to 5'
                : speaking
                  ? 'Reading the question aloud...'
                  : 'Tap the microphone and say a number from 1 to 5'}
            </p>
            <Button onClick={toggleSpeaking} variant="ghost" size="sm">
              {speaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
              {speaking ? 'Stop audio' : 'Repeat question'}
            </Button>
          </div>
        </section>

        <div className="mt-6 flex justify-between">
          <Button onClick={onCancel} variant="ghost">
            Exit voice mode
          </Button>
          {currentQuestionIndex > 0 && (
            <Button onClick={() => setCurrentQuestionIndex((prev) => prev - 1)} variant="outline">
              Previous question
            </Button>
          )}
        </div>
      </div>
    </VoiceShell>
  );
};

export default VoiceAssessment;