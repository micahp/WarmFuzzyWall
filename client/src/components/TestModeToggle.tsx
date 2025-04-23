import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type TestModeStatus = {
  testMode: boolean;
};

export default function TestModeToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the current test mode status
  const { data: testModeStatus, isLoading } = useQuery<TestModeStatus>({
    queryKey: ['/api/test-mode/status'],
    refetchOnWindowFocus: false,
  });

  // Set initial state once data is loaded
  useEffect(() => {
    if (testModeStatus && !isLoading) {
      setIsEnabled(testModeStatus.testMode);
    }
  }, [testModeStatus, isLoading]);

  // Toggle test mode
  const toggleTestMode = useMutation({
    mutationFn: async (enable: boolean) => {
      const endpoint = enable ? "/api/test-mode/enable" : "/api/test-mode/disable";
      const response = await apiRequest("POST", endpoint);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-mode/status'] });
      toast({
        title: isEnabled ? "Test Mode Disabled" : "Test Mode Enabled",
        description: isEnabled 
          ? "All test data has been cleared." 
          : "Sample warm fuzzies have been loaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to toggle test mode: ${error}`,
        variant: "destructive",
      });
      // Reset the toggle to its previous state
      setIsEnabled(!isEnabled);
    },
  });

  const handleToggleChange = (checked: boolean) => {
    setIsEnabled(checked);
    toggleTestMode.mutate(checked);
  };

  if (isLoading) return null;

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-200">
      <Switch
        id="test-mode"
        checked={isEnabled}
        onCheckedChange={handleToggleChange}
        disabled={toggleTestMode.isPending}
      />
      <Label htmlFor="test-mode" className="text-sm font-medium">
        Test Mode {isEnabled ? "On" : "Off"}
      </Label>
    </div>
  );
}