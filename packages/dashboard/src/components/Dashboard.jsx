import Header from './Header';
import ToolCard from './ToolCard';
import { TOOLS } from '../constants/tools';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-main">
        <p className="tool-section-label">Tools</p>
        <div className="tool-grid">
          {TOOLS.map(tool => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      </main>
    </div>
  );
}
