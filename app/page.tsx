"use client"

import { ImageProcessor } from "@/components/image-processor"
import { Paintbrush2, Github } from "lucide-react"
import Link from "next/link"
import { HelpModal } from "@/components/help-modal"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-primary bg-card">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 md:p-3 border-2 border-primary-foreground">
                <Paintbrush2 className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  GSPALLETEFORGE
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 tracking-wide">8-BIT BMP CONVERTER v1.0</p>
              </div>
            </div>
            <HelpModal />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <ImageProcessor />
      </main>

      <footer className="border-t-2 border-border mt-12 md:mt-16 py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 text-xs md:text-sm text-foreground">
              <span className="font-bold">CREATED BY </span>
              <a
                href="https://github.com/gastenoise"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-bold flex items-center gap-3 text-xs md:text-sm text-foreground"
              >
                GASTÓN URGORRI <Github className="h-4 w-4 md:h-5 md:w-5" />
                
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground text-center">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                TERMS & CONDITIONS
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                PRIVACY POLICY
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
