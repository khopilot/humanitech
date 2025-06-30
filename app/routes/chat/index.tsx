import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { MessageCircle } from 'lucide-react/dist/esm/icons/message-circle';

export default function ChatIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistant IA</h1>
        <p className="text-muted-foreground">
          Posez vos questions sur l'action contre les mines
        </p>
      </div>

      <Card className="h-[600px]">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Chat interface will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}