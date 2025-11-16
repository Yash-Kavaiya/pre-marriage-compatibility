import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, FileText, CheckCircle, Mic, MessageSquare, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface AssessmentLandingProps {
  onStartAssessment: (partner: 'A' | 'B', type?: 'regular' | 'voice') => void;
}

const AssessmentLanding = ({ onStartAssessment }: AssessmentLandingProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lighter via-white to-feminine-light">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-end mb-8 md:mb-16">
            <Link to="/contact">
              <Button variant="outline" className="shadow-soft border-border text-foreground hover:shadow-premium text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
                <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-20">
            <div className="mb-6 md:mb-8 relative inline-block">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full gradient-romantic flex items-center justify-center shadow-premium animate-pulse">
                <Heart className="w-8 h-8 md:w-12 md:h-12 text-white fill-white" />
              </div>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-lg md:text-2xl animate-pulse">💕</div>
              <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 text-lg md:text-2xl animate-pulse" style={{animationDelay: '0.5s'}}>💕</div>
            </div>
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight px-4">
              <span className="font-cormorant text-foreground">Marriage Compatibility</span>
              <span className="block romantic-title text-4xl md:text-7xl mt-2">Love Assessment</span>
            </h1>
            <div className="text-lg md:text-2xl font-dancing text-primary mb-4 md:mb-6 px-4">
              ♥ Building lasting bonds through understanding ♥
            </div>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Discover your relationship compatibility across 86 carefully crafted questions in 14 essential life areas.
              Create a stronger foundation for your future together with professional-grade insights.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20 px-4">
            <div className="card-premium p-6 md:p-8 text-center group hover:shadow-premium">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-success/20 transition-all">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-success" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold font-cormorant text-foreground mb-3 md:mb-4">86 Expert Questions</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Professionally crafted questions covering 14 critical life areas from core values to future planning
              </p>
            </div>

            <div className="card-premium p-6 md:p-8 text-center group hover:shadow-premium">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-primary/20 transition-all">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold font-cormorant text-foreground mb-3 md:mb-4">Smart Rating System</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Rate both importance and flexibility for nuanced compatibility insights and recommendations
              </p>
            </div>

            <div className="card-premium p-6 md:p-8 text-center group hover:shadow-premium">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-accent/20 transition-all">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold font-cormorant text-foreground mb-3 md:mb-4">Actionable Insights</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Get detailed compatibility analysis with personalized guidance and downloadable reports
              </p>
            </div>
          </div>

          {/* Assessment Options */}
          <div className="mb-12 md:mb-16 px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-5xl romantic-heading mb-3 md:mb-4">Choose Your Love Journey</h2>
              <p className="text-lg md:text-xl text-muted-foreground">Select your preferred assessment method</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-6 md:mb-8">
              {/* Traditional Assessment */}
              <div className="card-premium p-6 md:p-8 group hover:shadow-xl-custom">
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-masculine flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold font-cormorant text-foreground mb-2">Interactive Assessment</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Comprehensive questionnaire with elegant interface and instant feedback</p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => onStartAssessment('A', 'regular')}
                    className="w-full btn-primary py-2 md:py-3 text-base md:text-lg font-medium"
                  >
                    <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Partner A - Start Assessment
                  </Button>
                  <Button 
                    onClick={() => onStartAssessment('B', 'regular')}
                    className="w-full btn-secondary py-2 md:py-3 text-base md:text-lg font-medium"
                    variant="outline"
                  >
                    <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Partner B - Start Assessment
                  </Button>
                </div>
              </div>

              {/* Voice Assessment */}
              <div className="card-premium p-6 md:p-8 group hover:shadow-xl-custom">
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-feminine flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    <Mic className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold font-cormorant text-foreground mb-2">AI Voice Experience</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Cutting-edge voice interaction with AI-powered conversation flow</p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => onStartAssessment('A', 'voice')}
                    className="w-full bg-gradient-to-r from-feminine to-feminine/80 hover:from-feminine/90 hover:to-feminine/70 text-white shadow-premium py-2 md:py-3 text-base md:text-lg font-medium"
                  >
                    <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Partner A - Voice Assessment
                  </Button>
                  <Button 
                    onClick={() => onStartAssessment('B', 'voice')}
                    className="w-full border-feminine text-feminine hover:bg-feminine hover:text-white shadow-soft py-2 md:py-3 text-base md:text-lg font-medium"
                    variant="outline"
                  >
                    <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Partner B - Voice Assessment
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground text-lg font-dancing">
                💕 <em>Both partners complete assessments independently for optimal accuracy</em> 💕
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="card-premium p-6 md:p-10 mb-6 md:mb-8 mx-2 md:mx-0">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-4xl romantic-heading mb-3 md:mb-4">How It Works</h2>
              <p className="text-base md:text-xl text-muted-foreground">A sophisticated approach to relationship assessment</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs md:text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2 text-foreground font-cormorant">Dual Rating System</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Each question requires two thoughtful ratings on a 1-5 scale:</p>
                    <div className="mt-2 md:mt-3 space-y-1 md:space-y-2 text-xs md:text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full"></div>
                        <span><strong>Importance:</strong> Personal significance of this topic</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-success rounded-full"></div>
                        <span><strong>Flexibility:</strong> Willingness to compromise (1=very flexible, 5=non-negotiable)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs md:text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2 text-foreground font-cormorant">14 Essential Life Areas</h3>
                    <div className="text-muted-foreground space-y-1 md:space-y-2 text-xs md:text-sm">
                      <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                        <span>• Core Values & Life Philosophy</span>
                        <span>• Religion & Spiritual Beliefs</span>
                        <span>• Relationship Dynamics & Boundaries</span>
                        <span>• Children & Parenting Styles</span>
                        <span>• Financial Goals & Management</span>
                        <span>• Communication & Intimacy</span>
                        <span>• Career & Personal Growth</span>
                        <span className="font-medium">• Plus 7 additional critical areas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentLanding;