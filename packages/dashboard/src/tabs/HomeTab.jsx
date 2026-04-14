// Home tab — shows the tool card grid.
// The school header is intentionally omitted; each tool has its own header.
// Morning Dashboard summary will replace this content once tools are migrated.
import ToolCard from '../components/ToolCard';
import { TOOLS } from '../constants/tools';
import './HomeTab.css';

export default function HomeTab() {
  return (
    <div className="home-tab">
      <p className="home-section-label">Tools</p>
      <div className="home-tool-grid">
        {TOOLS.map(tool => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </div>
  );
}
