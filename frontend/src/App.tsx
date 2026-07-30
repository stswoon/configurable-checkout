import { ConfigEditor } from "@/components/ConfigEditor";
import { RuntimeView } from "@/components/RuntimeView";

export function App() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex min-h-0 flex-1">
        <section className="flex w-1/2 min-w-0 flex-col border-r p-4">
          <ConfigEditor />
        </section>

        <section className="w-1/2 min-w-0">
          <RuntimeView />
        </section>
      </div>
    </div>
  );
}
