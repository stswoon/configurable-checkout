import { ConfigEditor } from "@/components/ConfigEditor";
import { RuntimeView } from "@/components/RuntimeView";

export function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <section className="flex w-2/5 min-h-0 min-w-0 flex-col overflow-hidden border-r p-4">
          <ConfigEditor />
        </section>

        <section className="flex w-3/5 min-h-0 min-w-0 flex-col overflow-hidden">
          <RuntimeView />
        </section>
      </div>
    </div>
  );
}
