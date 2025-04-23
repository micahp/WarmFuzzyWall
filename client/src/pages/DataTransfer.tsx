import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DataTransfer() {
  const [deployedUrl, setDeployedUrl] = useState("");
  const [exportData, setExportData] = useState("");
  const [clearExisting, setClearExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      // Getting data from the current database
      const response = await fetch("/api/notes/export");
      const data = await response.json();
      setExportData(JSON.stringify(data, null, 2));
      
      toast({
        title: "Data Exported",
        description: `Successfully exported ${data.notes.length} notes from current database.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Error exporting data: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      
      if (!exportData.trim()) {
        toast({
          title: "Import Failed",
          description: "No data to import. Please export data first.",
          variant: "destructive",
        });
        return;
      }
      
      let dataToImport;
      try {
        dataToImport = JSON.parse(exportData);
      } catch (e) {
        toast({
          title: "Import Failed",
          description: "Invalid JSON format. Please check the data.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest("POST", "/api/notes/import", {
        notes: dataToImport.notes || [],
        clearExisting
      });
      
      const result = await response.json();
      
      toast({
        title: "Import Successful",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: `Error importing data: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFromDeployed = async () => {
    try {
      setLoading(true);
      if (!deployedUrl) {
        toast({
          title: "Fetch Failed",
          description: "Please enter the deployed URL",
          variant: "destructive",
        });
        return;
      }
      
      // Normalize the URL
      let normalizedUrl = deployedUrl;
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      if (normalizedUrl.endsWith('/')) {
        normalizedUrl = normalizedUrl.slice(0, -1);
      }
      
      // Fetch data from the deployed instance
      const response = await fetch(`${normalizedUrl}/api/notes/export`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setExportData(JSON.stringify(data, null, 2));
      
      toast({
        title: "Data Retrieved",
        description: `Successfully retrieved ${data.notes.length} notes from deployed instance.`,
      });
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: `Error fetching from deployed instance: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Database Transfer Utility</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fetch from Deployed Instance</CardTitle>
            <CardDescription>
              Retrieve notes from your deployed Replit instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deployed-url">Deployed URL</Label>
                <Input 
                  id="deployed-url" 
                  placeholder="e.g., your-app.replit.app" 
                  value={deployedUrl}
                  onChange={(e) => setDeployedUrl(e.target.value)}
                />
              </div>
              <Button 
                onClick={fetchFromDeployed} 
                disabled={loading || !deployedUrl}
              >
                {loading ? "Fetching..." : "Fetch Notes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      
        <Card>
          <CardHeader>
            <CardTitle>Local Database Operations</CardTitle>
            <CardDescription>
              Export or import notes in your current database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleExport} 
                variant="outline" 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Exporting..." : "Export Current Database"}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="clear-existing" 
                  checked={clearExisting}
                  onCheckedChange={(checked) => setClearExisting(!!checked)}
                />
                <Label htmlFor="clear-existing" className="text-sm">
                  Clear existing notes before import (CAUTION)
                </Label>
              </div>
              
              <Button 
                onClick={handleImport} 
                disabled={loading || !exportData.trim()}
                className="w-full"
              >
                {loading ? "Importing..." : "Import Notes to Current Database"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Notes Data</CardTitle>
          <CardDescription>
            This is the JSON data that will be imported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-96 font-mono text-xs p-4 border rounded-md"
            value={exportData}
            onChange={(e) => setExportData(e.target.value)}
            placeholder="Data will appear here after export or fetch"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setExportData("")}
            disabled={!exportData.trim()}
          >
            Clear Data
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              try {
                const data = JSON.parse(exportData);
                setExportData(JSON.stringify(data, null, 2));
                toast({
                  title: "Format Successful",
                  description: "JSON data has been formatted",
                });
              } catch (e) {
                toast({
                  title: "Format Failed",
                  description: "Invalid JSON format",
                  variant: "destructive",
                });
              }
            }}
            disabled={!exportData.trim()}
          >
            Format JSON
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}