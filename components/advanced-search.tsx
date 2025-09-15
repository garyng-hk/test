"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
}

export interface SearchFilters {
  songName: string
  artist: string
  key: string
  genre: string
  tempo: string
  dateRange: {
    from: string
    to: string
  }
  tags: string[]
}

const genres = ["Worship", "Contemporary", "Traditional", "Gospel", "Rock", "Folk", "Jazz"]
const tempos = ["Slow", "Medium", "Fast", "Ballad", "Upbeat"]
const commonTags = ["Christmas", "Easter", "Communion", "Baptism", "Wedding", "Funeral", "Youth"]

export function AdvancedSearch({ onFiltersChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    songName: "",
    artist: "",
    key: "any",
    genre: "any",
    tempo: "any",
    dateRange: { from: "", to: "" },
    tags: [],
  })

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag]
    handleFilterChange("tags", newTags)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      songName: "",
      artist: "",
      key: "any",
      genre: "any",
      tempo: "any",
      dateRange: { from: "", to: "" },
      tags: [],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          進階搜尋
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>進階搜尋</SheetTitle>
          <SheetDescription>使用詳細篩選器來找到完美的和弦譜</SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {/* Basic Search */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">基本搜尋</h3>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="song-name">歌名</Label>
                <Input
                  id="song-name"
                  placeholder="輸入歌名..."
                  value={filters.songName}
                  onChange={(e) => handleFilterChange("songName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="artist">藝人</Label>
                <Input
                  id="artist"
                  placeholder="輸入藝人名稱..."
                  value={filters.artist}
                  onChange={(e) => handleFilterChange("artist", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Musical Properties */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">音樂屬性</h3>
            <div className="grid gap-3">
              <div>
                <Label>調性</Label>
                <Select value={filters.key} onValueChange={(value) => handleFilterChange("key", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">任何調性</SelectItem>
                    {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>風格</Label>
                <Select value={filters.genre} onValueChange={(value) => handleFilterChange("genre", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">任何風格</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>節拍</Label>
                <Select value={filters.tempo} onValueChange={(value) => handleFilterChange("tempo", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">任何節拍</SelectItem>
                    {tempos.map((tempo) => (
                      <SelectItem key={tempo} value={tempo}>
                        {tempo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">標籤</h3>
            <div className="grid grid-cols-2 gap-2">
              {commonTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <Label htmlFor={tag} className="text-sm">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">日期範圍</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date-from">開始日期</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date-to">結束日期</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, to: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
            <X className="h-4 w-4 mr-2" />
            清除所有篩選器
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
