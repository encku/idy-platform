import { describe, it, expect } from "vitest"
import { render } from "@/__tests__/test-utils"

// ── Simple UI component smoke tests ──
// These verify shadcn/radix components import and render without crashing

describe("UI Components — Smoke Tests", () => {
  it("Button renders", async () => {
    const { Button } = await import("@/components/ui/button")
    const { container } = render(<Button>Click</Button>)
    expect(container.innerHTML).not.toBe("")
  })

  it("Input renders", async () => {
    const { Input } = await import("@/components/ui/input")
    const { container } = render(<Input placeholder="test" />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Textarea renders", async () => {
    const { Textarea } = await import("@/components/ui/textarea")
    const { container } = render(<Textarea placeholder="test" />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Badge renders", async () => {
    const { Badge } = await import("@/components/ui/badge")
    const { container } = render(<Badge>Label</Badge>)
    expect(container.innerHTML).not.toBe("")
  })

  it("Card renders", async () => {
    const { Card, CardHeader, CardContent, CardTitle } = await import(
      "@/components/ui/card"
    )
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Skeleton renders", async () => {
    const { Skeleton } = await import("@/components/ui/skeleton")
    const { container } = render(<Skeleton className="h-4 w-32" />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Separator renders", async () => {
    const { Separator } = await import("@/components/ui/separator")
    const { container } = render(<Separator />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Label renders", async () => {
    const { Label } = await import("@/components/ui/label")
    const { container } = render(<Label>Label text</Label>)
    expect(container.innerHTML).not.toBe("")
  })

  it("Table renders", async () => {
    const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } =
      await import("@/components/ui/table")
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Col</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Checkbox renders", async () => {
    const { Checkbox } = await import("@/components/ui/checkbox")
    const { container } = render(<Checkbox />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Switch renders", async () => {
    const { Switch } = await import("@/components/ui/switch")
    const { container } = render(<Switch />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Progress renders", async () => {
    const { Progress } = await import("@/components/ui/progress")
    const { container } = render(<Progress value={50} />)
    expect(container.innerHTML).not.toBe("")
  })

  it("Avatar renders", async () => {
    const { Avatar, AvatarFallback } = await import("@/components/ui/avatar")
    const { container } = render(
      <Avatar>
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Tabs renders", async () => {
    const { Tabs, TabsList, TabsTrigger, TabsContent } = await import(
      "@/components/ui/tabs"
    )
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Dialog renders", async () => {
    const { Dialog, DialogContent, DialogHeader, DialogTitle } = await import(
      "@/components/ui/dialog"
    )
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    // Portal-based — content renders in document.body, not container
    expect(document.body.innerHTML).toContain("Test Dialog")
  })

  it("Select renders", async () => {
    const { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } =
      await import("@/components/ui/select")
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Sheet renders", async () => {
    const { Sheet, SheetContent, SheetHeader, SheetTitle } = await import(
      "@/components/ui/sheet"
    )
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Test Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
    // Portal-based — content renders in document.body
    expect(document.body.innerHTML).toContain("Test Sheet")
  })

  it("ScrollArea renders", async () => {
    const { ScrollArea } = await import("@/components/ui/scroll-area")
    const { container } = render(
      <ScrollArea className="h-40">
        <div>Content</div>
      </ScrollArea>
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Tooltip renders", async () => {
    const { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } =
      await import("@/components/ui/tooltip")
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(container.innerHTML).not.toBe("")
  })
})
