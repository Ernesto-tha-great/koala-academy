// app/admin/settings/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SettingsFormValues {
  siteName: string;
  siteDescription: string;
  adminEmails: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
//   const updateSettings = useMutation(api.admin.updateSettings);

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      siteName: "Morph Blog",
      siteDescription: "",
      adminEmails: "",
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
    //   await updateSettings(values);
      toast({
        title: "OOps",
        description: "Ernest says: I cant let you do that yet buddy!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while saving your settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your blog
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Brief description of your blog
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminEmails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Emails</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="One email per line"
                    />
                  </FormControl>
                  <FormDescription>
                    Users with these emails will be granted admin access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}