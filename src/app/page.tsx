'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { fetchTopics, addQuestion, processBulkUpload } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { LogOut, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  
  // Single Question State
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState('0');
  const [difficulty, setDifficulty] = useState('easy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Upload State
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadTopics();
    }
  }, [user]);

  const loadTopics = async () => {
    try {
      const data = await fetchTopics();
      setTopics(data);
      if (data.length > 0) {
        setSelectedTopic(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load topics');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return toast.error('Please select a topic first');
    if (!questionText) return toast.error('Question text is required');
    if (options.some(opt => !opt.trim())) return toast.error('All 4 options are required');

    setIsSubmitting(true);
    try {
      await addQuestion(selectedTopic, {
        text: questionText,
        options,
        correctIndex,
        difficulty
      });
      toast.success('Question added successfully!');
      // Reset form
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex('0');
    } catch (error: any) {
      toast.error(error.message || 'Error adding question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    if (!selectedTopic) return toast.error('Please select a topic first');

    const file = acceptedFiles[0];
    setIsUploading(true);
    try {
      const count = await processBulkUpload(file, selectedTopic);
      toast.success(`Successfully uploaded ${count} questions!`);
    } catch (error: any) {
      toast.error(error.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  }, [selectedTopic]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Knowledge Battle Admin</h1>
            <p className="text-muted-foreground mt-1">Manage questions for Amol Tracker</p>
          </div>
          <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-white border-destructive" onClick={() => signOut(auth)}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Top area for Topic Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Select Topic</CardTitle>
                <CardDescription>Choose the target topic for new questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedTopic} onValueChange={(val) => setSelectedTopic(val as string)}>
                  <SelectTrigger className="w-full border-border focus:ring-primary">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name || topic.title || topic.id}
                      </SelectItem>
                    ))}
                    {topics.length === 0 && <SelectItem value="none" disabled>No topics found</SelectItem>}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Forms Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-card border border-border rounded-xl">
                <TabsTrigger value="single" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Single Add</TabsTrigger>
                <TabsTrigger value="bulk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Bulk Upload (CSV)</TabsTrigger>
              </TabsList>

              {/* Single Add Form */}
              <TabsContent value="single">
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle>Add Single Question</CardTitle>
                    <CardDescription>Enter the question details manually. Selected answer will be marked as correct.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSingleSubmit} className="space-y-6">
                      
                      <div className="space-y-2">
                        <Label htmlFor="question" className="text-base font-semibold">Question Text</Label>
                        <Input 
                          id="question" 
                          placeholder="e.g. What is the first pillar of Islam?" 
                          value={questionText}
                          onChange={e => setQuestionText(e.target.value)}
                          className="text-lg py-6 border-border focus:border-primary focus:ring-primary font-medium bg-card"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-semibold">Options & Correct Answer</Label>
                        <RadioGroup value={correctIndex} onValueChange={setCorrectIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {options.map((opt, i) => (
                            <div key={i} className={`flex items-center space-x-3 space-y-0 p-4 rounded-xl border ${correctIndex === i.toString() ? 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)]/10' : 'border-border bg-card'}`}>
                              <RadioGroupItem value={i.toString()} id={`opt-${i}`} className={correctIndex === i.toString() ? 'border-[var(--color-brand-gold)] text-[var(--color-brand-gold)]' : ''} />
                              <div className="flex-1">
                                <Input 
                                  placeholder={`Option ${i + 1}`}
                                  value={opt}
                                  onChange={e => handleOptionChange(i, e.target.value)}
                                  className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                                />
                              </div>
                              {correctIndex === i.toString() && (
                                <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-gold)]" />
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2 max-w-xs">
                        <Label>Difficulty</Label>
                        <Select value={difficulty} onValueChange={(val) => setDifficulty(val as string)}>
                          <SelectTrigger className="border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-xl">
                        {isSubmitting ? "Adding..." : "Add Question"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bulk Upload */}
              <TabsContent value="bulk">
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle>Bulk Upload Questions</CardTitle>
                    <CardDescription>
                      Upload a CSV file. Required columns: <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">Question, Option1, Option2, Option3, Option4, CorrectIndex, Difficulty</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 min-h-[300px]
                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/50'}`}
                    >
                      <input {...getInputProps()} />
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div>
                        {isUploading ? (
                          <p className="text-lg font-semibold text-primary">Processing upload...</p>
                        ) : isDragActive ? (
                          <p className="text-lg font-semibold text-primary">Drop the CSV file here...</p>
                        ) : (
                          <>
                            <p className="text-lg font-semibold mb-1">Drag & drop your CSV file here</p>
                            <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>

      </div>
    </div>
  );
}
