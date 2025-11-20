import { Paintbrush2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-primary bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-3 border-2 border-primary-foreground">
              <Paintbrush2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">GSPALLETEFORGE</h1>
              <p className="text-sm text-muted-foreground mt-1 tracking-wide">TERMS & CONDITIONS</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 border-2 border-border">
          <h2 className="text-2xl font-bold mb-6 text-foreground">TERMS AND CONDITIONS OF USE</h2>

          <div className="space-y-6 text-sm text-foreground">
            <section>
              <h3 className="font-bold text-lg mb-2">1. ACCEPTANCE OF TERMS</h3>
              <p className="text-muted-foreground">
                By accessing and using GSPALLETEFORGE, you agree to be bound by these terms and conditions. If you do
                not agree with any part of these terms, you should not use this service.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. USE OF SERVICE</h3>
              <p className="text-muted-foreground mb-2">
                GSPALLETEFORGE is a free image conversion tool to 8-bit BMP format. The service is provided "as is"
                without warranties of any kind.
              </p>
              <p className="text-muted-foreground">
                It is prohibited to use this service to process illegal, offensive content or content that violates
                third-party rights.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. INTELLECTUAL PROPERTY</h3>
              <p className="text-muted-foreground">
                All processed images are the property of the users who upload them. GSPALLETEFORGE does not claim any
                rights over the original or processed images.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. LIMITATION OF LIABILITY</h3>
              <p className="text-muted-foreground">
                GSPALLETEFORGE is not responsible for data loss, processing errors, or any direct or indirect damage
                that may result from using this service.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. MODIFICATIONS</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the service after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. CONTACT</h3>
              <p className="text-muted-foreground">
                For any questions about these terms, you can contact the developer through GitHub:{" "}
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
