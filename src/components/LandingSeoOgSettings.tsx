import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import {
  applyLandingSeo,
  defaultLandingSeo,
  loadLandingSeo,
  saveLandingSeo,
} from "@/utils/landingSeo";

export default function LandingSeoOgSettings() {
  const initial = useMemo(() => loadLandingSeo(), []);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [ogImage, setOgImage] = useState(initial.ogImage);

  const titleCount = title.trim().length;
  const descCount = description.trim().length;
  const titleOk = titleCount > 0 && titleCount <= 60;
  const descOk = descCount > 0 && descCount <= 160;

  const onSave = () => {
    const next = {
      title: title.trim(),
      description: description.trim(),
      ogImage: ogImage.trim() || defaultLandingSeo.ogImage,
    };
    saveLandingSeo(next);
    applyLandingSeo(next);
  };

  const onReset = () => {
    setTitle(defaultLandingSeo.title);
    setDescription(defaultLandingSeo.description);
    setOgImage(defaultLandingSeo.ogImage);
    saveLandingSeo(defaultLandingSeo);
    applyLandingSeo(defaultLandingSeo);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Landing SEO & OG Settings">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Landing SEO / OG Settings</DialogTitle>
          <DialogDescription>
            Updates the browser title + meta tags for sharing previews. (For true crawl-time SEO,
            publish after setting your defaults.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-4">
              <Label htmlFor="landing-seo-title">Title</Label>
              <span className={"text-xs " + (titleOk ? "text-muted-foreground" : "text-destructive")}
              >
                {titleCount}/60
              </span>
            </div>
            <Input
              id="landing-seo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultLandingSeo.title}
            />
            {!titleOk && (
              <p className="text-xs text-destructive">Keep the title under 60 characters.</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-4">
              <Label htmlFor="landing-seo-description">Description</Label>
              <span className={"text-xs " + (descOk ? "text-muted-foreground" : "text-destructive")}
              >
                {descCount}/160
              </span>
            </div>
            <Textarea
              id="landing-seo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={defaultLandingSeo.description}
              rows={4}
            />
            {!descOk && (
              <p className="text-xs text-destructive">Keep the description under 160 characters.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landing-seo-og">OG Image URL</Label>
            <Input
              id="landing-seo-og"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="/og-image.png"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setOgImage("/og-image.png")}
              >
                Use generated OG
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(ogImage || "/og-image.png", "_blank", "noopener,noreferrer")}
              >
                Preview image
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={onReset}>
              Reset defaults
            </Button>
            <Button type="button" onClick={onSave} disabled={!titleOk || !descOk}>
              Save & Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
