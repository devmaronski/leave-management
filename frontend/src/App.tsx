import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Leave Management System</h1>
        <p className="text-muted-foreground mb-6">Frontend Bootstrap - Tailwind CSS & shadcn/ui</p>
        
        <div className="flex gap-4 mb-6">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Pending</Badge>
          <Badge variant="destructive">Rejected</Badge>
          <Badge variant="outline">Cancelled</Badge>
        </div>
      </div>
    </div>
  );
}

export default App;
