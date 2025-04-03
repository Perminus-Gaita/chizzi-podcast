import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Rocket, ArrowRight } from 'lucide-react';
import Link from "next/link";

const WorkspaceIntro = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Team Collaboration",
      description: "Work seamlessly with your team members in a shared space designed for productivity"
    },
    {
      icon: <Building2 className="w-8 h-8 text-primary" />,
      title: "Organization Management", 
      description: "Keep your projects, resources, and team members organized in one central location"
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Streamlined Workflow",
      description: "Accelerate your team&apos;s productivity with integrated tools and features"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Workspaces
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your team&apos;s command center for collaboration and productivity
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Ready to get started?</h2>
              <p className="text-muted-foreground">
                Create your first workspace and invite your team members
              </p>
            </div>
            <Link href="/workspace/create">
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                Create Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceIntro;