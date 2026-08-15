'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { fetchTopics, addQuestion, processBulkUpload, createTopic, fetchQuestions, editTopic, deleteTopic, editQuestion, deleteQuestion } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { LogOut, UploadCloud, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

  // New Topic State
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicIcon, setNewTopicIcon] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Question List State
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Topic Edit State
  const [isEditTopicDialogOpen, setIsEditTopicDialogOpen] = useState(false);
  const [editTopicData, setEditTopicData] = useState({ name: '', description: '', iconName: '' });

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

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions(selectedTopic);
    } else {
      setQuestions([]);
    }
  }, [selectedTopic]);

  const loadQuestions = async (topicId: string) => {
    setIsLoadingQuestions(true);
    try {
      const data = await fetchQuestions(topicId);
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

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

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return toast.error('Topic name is required');
    
    setIsCreatingTopic(true);
    try {
      const topic = await createTopic({
        name: newTopicName,
        description: newTopicDesc,
        iconName: newTopicIcon
      });
      toast.success('Topic created successfully!');
      setNewTopicName('');
      setNewTopicDesc('');
      setNewTopicIcon('');
      
      // Reload topics and select the new one
      const data = await fetchTopics();
      setTopics(data);
      setSelectedTopic(topic.id);
    } catch (error: any) {
      toast.error(error.message || 'Error creating topic');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    if (!editTopicData.name.trim()) return toast.error('Topic name is required');
    
    try {
      await editTopic(selectedTopic, {
        ...editTopicData,
        isActive: true
      });
      toast.success('Topic updated successfully!');
      setIsEditTopicDialogOpen(false);
      loadTopics();
    } catch (error: any) {
      toast.error(error.message || 'Error updating topic');
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return;
    if (confirm('Are you sure you want to delete this topic? All questions must be handled manually.')) {
      try {
        await deleteTopic(selectedTopic);
        toast.success('Topic deleted successfully!');
        setSelectedTopic('');
        loadTopics();
      } catch (error: any) {
        toast.error(error.message || 'Error deleting topic');
      }
    }
  };

  const openEditTopicDialog = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    if (topic) {
      setEditTopicData({ name: topic.name || '', description: topic.description || '', iconName: topic.iconName || '' });
      setIsEditTopicDialogOpen(true);
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(selectedTopic, questionId);
        toast.success('Question deleted successfully!');
        loadQuestions(selectedTopic);
      } catch (error: any) {
        toast.error(error.message || 'Error deleting question');
      }
    }
  };

  const handleEditQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (!editingQuestion.text) return toast.error('Question text is required');
    if (editingQuestion.options.some((opt: string) => !opt.trim())) return toast.error('All 4 options are required');

    try {
      await editQuestion(selectedTopic, editingQuestion.id, {
        text: editingQuestion.text,
        options: editingQuestion.options,
        correctIndex: editingQuestion.correctIndex.toString(),
        difficulty: editingQuestion.difficulty,
        isActive: true
      });
      toast.success('Question updated successfully!');
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      loadQuestions(selectedTopic);
    } catch (error: any) {
      toast.error(error.message || 'Error updating question');
    }
  };

  const handleEditOptionChange = (index: number, value: string) => {
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-soft">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Knowledge Battle Admin</h1>
            <p className="text-muted-foreground mt-1">Manage questions for Amol Tracker</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <ThemeToggle />
            <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-white border-destructive" onClick={() => signOut(auth)}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Top area for Topic Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">Select Topic</CardTitle>
                  <CardDescription>Target topic for questions</CardDescription>
                </div>
                {selectedTopic && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={openEditTopicDialog} className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDeleteTopic} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Select key={selectedTopic || 'empty'} value={selectedTopic} onValueChange={(val) => setSelectedTopic(val as string)}>
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

            <Card className="border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Create Topic</CardTitle>
                <CardDescription>Add a new topic category</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topicName" className="text-sm font-semibold">Topic Name</Label>
                    <Input 
                      id="topicName" 
                      placeholder="e.g. General Knowledge" 
                      value={newTopicName}
                      onChange={e => setNewTopicName(e.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicDesc" className="text-sm font-semibold">Description (Optional)</Label>
                    <Input 
                      id="topicDesc" 
                      placeholder="e.g. Basic GK questions" 
                      value={newTopicDesc}
                      onChange={e => setNewTopicDesc(e.target.value)}
                      className="border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicIcon" className="text-sm font-semibold">Icon Name (Optional)</Label>
                    <Input 
                      id="topicIcon" 
                      placeholder="e.g. globe_icon" 
                      value={newTopicIcon}
                      onChange={e => setNewTopicIcon(e.target.value)}
                      className="border-border"
                    />
                  </div>
                  <Button type="submit" disabled={isCreatingTopic} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isCreatingTopic ? "Creating..." : "Create Topic"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Forms Area */}
          <div className="lg:col-span-3 overflow-hidden">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="flex flex-col sm:flex-row h-auto w-full mb-6 bg-card border border-border rounded-xl">
                <TabsTrigger value="list" className="w-full sm:flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">Question List</TabsTrigger>
                <TabsTrigger value="single" className="w-full sm:flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">Single Add</TabsTrigger>
                <TabsTrigger value="bulk" className="w-full sm:flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5">Bulk Upload (CSV)</TabsTrigger>
              </TabsList>

              {/* Question List Tab */}
              <TabsContent value="list" className="mt-0">
                <Card className="border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Manage questions for the selected topic.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingQuestions ? (
                      <p>Loading questions...</p>
                    ) : questions.length === 0 ? (
                      <p className="text-muted-foreground">No questions found for this topic.</p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Question</TableHead>
                              <TableHead>Difficulty</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questions.map((q) => (
                              <TableRow key={q.id}>
                                <TableCell className="font-medium max-w-xs truncate">{q.text || q.question || 'No Text'}</TableCell>
                                <TableCell>{q.difficulty}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={() => { 
                                    setEditingQuestion({
                                      ...q,
                                      text: q.text || q.question || '',
                                      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['', '', '', ''],
                                      correctIndex: q.correctIndex ?? 0,
                                      difficulty: q.difficulty || 'easy'
                                    }); 
                                    setIsEditDialogOpen(true); 
                                  }}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteQuestion(q.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Single Add Form */}
              <TabsContent value="single" className="mt-0">
                <Card className="border-border shadow-soft">
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
                            <div key={i} className={`flex items-center space-x-3 space-y-0 p-4 rounded-xl border transition-colors ${correctIndex === i.toString() ? 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)]/10' : 'border-border bg-card hover:bg-[var(--color-accent-wash)]'}`}>
                              <RadioGroupItem value={i.toString()} id={`opt-${i}`} className={correctIndex === i.toString() ? 'border-[var(--color-brand-gold)] text-[var(--color-brand-gold)]' : ''} />
                              <div className="flex-1 min-w-0">
                                <Input 
                                  placeholder={`Option ${i + 1}`}
                                  value={opt}
                                  onChange={e => handleOptionChange(i, e.target.value)}
                                  className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent w-full"
                                />
                              </div>
                              {correctIndex === i.toString() && (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[var(--color-brand-gold)]" />
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

                      <div className="pt-4 sm:sticky sm:bottom-4 z-10 bg-background/80 backdrop-blur-sm sm:bg-transparent p-4 -mx-4 sm:p-0 sm:mx-0 border-t sm:border-0 border-border mt-8">
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-xl shadow-soft">
                          {isSubmitting ? "Adding..." : "Add Question"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bulk Upload */}
              <TabsContent value="bulk" className="mt-0">
                <Card className="border-border shadow-soft">
                  <CardHeader>
                    <CardTitle>Bulk Upload Questions</CardTitle>
                    <CardDescription>
                      Upload a CSV file. Required columns: <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs break-all">Question, Option1, Option2, Option3, Option4, CorrectIndex, Difficulty</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-xl p-6 md:p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 min-h-[300px]
                        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-[var(--color-accent-wash)]'}`}
                    >
                      <input {...getInputProps()} />
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div className="max-w-full overflow-hidden">
                        {isUploading ? (
                          <p className="text-lg font-semibold text-primary">Processing upload...</p>
                        ) : isDragActive ? (
                          <p className="text-lg font-semibold text-primary">Drop the CSV file here...</p>
                        ) : (
                          <>
                            <p className="text-lg font-semibold mb-1">Drag & drop your CSV file here</p>
                            <p className="text-sm text-muted-foreground break-words">or click to browse from your computer</p>
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

      {/* Edit Topic Dialog */}
      <Dialog open={isEditTopicDialogOpen} onOpenChange={setIsEditTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>Update topic details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTopic} className="space-y-4">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input value={editTopicData.name} onChange={e => setEditTopicData({...editTopicData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editTopicData.description} onChange={e => setEditTopicData({...editTopicData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Icon Name</Label>
              <Input value={editTopicData.iconName} onChange={e => setEditTopicData({...editTopicData, iconName: e.target.value})} />
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Modify question details.</DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <form onSubmit={handleEditQuestionSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Question Text</Label>
                <Input value={editingQuestion.text} onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})} className="text-lg py-6" />
              </div>
              <div className="space-y-4">
                <Label className="text-base font-semibold">Options & Correct Answer</Label>
                <RadioGroup value={editingQuestion.correctIndex.toString()} onValueChange={val => setEditingQuestion({...editingQuestion, correctIndex: parseInt(val)})} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingQuestion.options.map((opt: string, i: number) => (
                    <div key={i} className={`flex items-center space-x-3 space-y-0 p-4 rounded-xl border transition-colors ${editingQuestion.correctIndex.toString() === i.toString() ? 'border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)]/10' : 'border-border'}`}>
                      <RadioGroupItem value={i.toString()} id={`edit-opt-${i}`} />
                      <Input value={opt} onChange={e => handleEditOptionChange(i, e.target.value)} className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent" />
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Difficulty</Label>
                <Select value={editingQuestion.difficulty} onValueChange={(val) => setEditingQuestion({...editingQuestion, difficulty: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
