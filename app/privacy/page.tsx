import { Paintbrush2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-primary bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-3 border-2 border-primary-foreground">
              <Paintbrush2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              {/* Updated app name to GSPALLETTEFORGE and translated to English */}
              <h1 className="text-4xl font-bold tracking-tight text-foreground">GSPALLETTEFORGE</h1>
              <p className="text-sm text-muted-foreground mt-1 tracking-wide">PRIVACY POLICY</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 border-2 border-border">
          <h2 className="text-2xl font-bold mb-6 text-foreground">PRIVACY POLICY</h2>

          <div className="space-y-6 text-sm text-foreground">
            <section>
              <h3 className="font-bold text-lg mb-2">1. INFORMATION WE COLLECT</h3>
              <p className="text-muted-foreground">
                GSPALLETTEFORGE is a web application that runs entirely in your browser. We do not collect, store, or
                transmit any personal information or images to external servers.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. LOCAL PROCESSING</h3>
              <p className="text-muted-foreground">
                All images you upload are processed locally on your device. Images never leave your browser and are not
                saved on any server.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. COOKIES AND STORAGE</h3>
              <p className="text-muted-foreground">
                We do not use tracking cookies or analytics systems. No information is stored on your device beyond the
                current browser session.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. THIRD PARTIES</h3>
              <p className="text-muted-foreground">
                We do not share any information with third parties because we do not collect any information. This
                application has no integrations with analytics, advertising, or tracking services.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. SECURITY</h3>
              <p className="text-muted-foreground">
                Since all information is processed locally in your browser, the security of your images depends on the
                security of your device and browser.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. CHANGES TO THIS POLICY</h3>
              <p className="text-muted-foreground">
                We reserve the right to update this privacy policy at any time. Any changes will be posted on this page.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. CONTACT</h3>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy, you can contact the developer through GitHub:{" "}
                <a href="https://github.com/gastenoise" className="text-primary hover:underline">
                  @gastenoise
                </a>
              </p>
            </section>
          </div>

          <Link href="/">
            <Button className="mt-8 font-bold border-2 border-primary-foreground">BACK TO APP</Button>
          </Link>
        </Card>
      </main>
    </div>
  )
}
