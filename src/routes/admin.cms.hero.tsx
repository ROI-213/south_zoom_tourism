import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Need to initialize the client here or import from lib
// For simplicity in this route, we can import if available, else inline
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/cms/hero")({
  component: HeroSlidesManager,
});

function HeroSlidesManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      console.error("Error fetching slides:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Hero Slides</h3>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Slide
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading slides...</TableCell>
                </TableRow>
              ) : slides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No slides found. Click "Add Slide" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell className="font-medium">{slide.display_order}</TableCell>
                    <TableCell>{slide.title}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[200px]">
                      {slide.subtitle}
                    </TableCell>
                    <TableCell>
                      {slide.active ? (
                        <Badge variant="outline" className="text-green-500 bg-green-500/10 border-green-500/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
