import React, { useState } from 'react';
import { Course, VersionType, CourseVersion } from '../types';
import { calculateNextVersion } from '../services/versioningService';
import {
  History,
  GitCommit,
  ArchiveRestore,
  ShieldCheck,
  FileClock,
  CheckCircle2,
  X
} from 'lucide-react';

interface VersionControlPanelProps {
  course: Course;
  onPublish: (type: VersionType, notes: string) => void;
  onRestore: (version: CourseVersion) => void;
  onClose: () => void;
}

const VersionControlPanel: React.FC<VersionControlPanelProps> = ({ course, onPublish, onRestore, onClose }) => {
  const [activeTab, setActiveTab] = useState<'publish' | 'history' | 'audit'>('publish');
  const [releaseType, setReleaseType] = useState<VersionType>(VersionType.MINOR);
  const [releaseNotes, setReleaseNotes] = useState('');

  const nextVersion = calculateNextVersion(course.currentVersion, releaseType);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-bg-primary shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 border-l border-hama-gold/10 relative overflow-hidden">
        <div className="noise opacity-10" />
        <div className="relative z-10 flex flex-col h-full">

          {/* Header */}
          <div className="bg-bg-primary border-b border-hama-gold/10 px-6 md:px-8 py-5 md:py-6 flex justify-between items-center z-20 sticky top-0 backdrop-blur-xl">
            <div className="flex items-center gap-3 md:gap-4 font-sans">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-hama-gold/10 border border-hama-gold/20 rounded-xl flex items-center justify-center text-hama-gold">
                <GitCommit className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
              </div>
              <div>
                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-text-primary">Project Versions</h2>
                <p className="text-[9px] md:text-[10px] font-bold text-hama-gold/60 uppercase tracking-widest mt-0.5">Active Revision: v{course.currentVersion}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary transition-colors bg-white/5 rounded-lg border border-white/5">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5 bg-black/20">
            {[
              { id: 'publish', label: 'Release' },
              { id: 'history', label: 'History' },
              { id: 'audit', label: 'Logging' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-hama-gold' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-hama-gold shadow-[0_0_10px_rgba(242,201,76,0.5)]"></div>}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 md:py-8 scrollbar-none">

            {/* PUBLISH TAB */}
            {activeTab === 'publish' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Submission Type</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { type: VersionType.MINOR, label: 'Minor Update', desc: 'Refinements to existing course content.', color: 'hama-gold' },
                      { type: VersionType.MAJOR, label: 'Major Release', desc: 'Structural changes or new module introductions.', color: 'red-500' },
                      { type: VersionType.PATCH, label: 'Standard Fix', desc: 'Correction of minor errors or typos.', color: 'text-muted' }
                    ].map((item) => (
                      <label key={item.type} className={`block p-5 rounded-2xl border cursor-pointer transition-all duration-300 group ${releaseType === item.type
                        ? 'bg-hama-gold/10 border-hama-gold shadow-lg shadow-hama-gold/5'
                        : 'bg-white/2 border-white/5 hover:bg-white/5'
                        }`}>
                        <div className="flex items-start gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${releaseType === item.type ? 'border-hama-gold bg-hama-gold ring-4 ring-hama-gold/20' : 'border-white/10 group-hover:border-white/30'
                            }`}>
                            {releaseType === item.type && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                            <input
                              type="radio"
                              name="releaseType"
                              className="hidden"
                              checked={releaseType === item.type}
                              onChange={() => setReleaseType(item.type)}
                            />
                          </div>
                          <div>
                            <span className={`block text-[11px] font-black uppercase tracking-widest ${releaseType === item.type ? 'text-white' : 'text-text-secondary'}`}>
                              {item.label} ({calculateNextVersion(course.currentVersion, item.type)})
                            </span>
                            <span className="block text-[10px] text-text-muted mt-1 font-medium">{item.desc}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Release Log</label>
                  <textarea
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-5 text-[11px] font-bold uppercase tracking-widest text-text-primary focus:ring-1 focus:ring-hama-gold/30 outline-none placeholder:text-white/10 resize-none transition-all"
                    placeholder="Describe the changes in this version..."
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {course.versions.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <History size={48} className="mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">No version history detected.</p>
                  </div>
                ) : (
                  course.versions.map((ver, idx) => (
                    <div key={idx} className="glass border-hama-gold/10 p-6 hover:border-hama-gold/20 transition-all duration-500 group bg-bg-secondary rounded-2xl mb-4 relative overflow-hidden">
                      <div className="noise opacity-10" />
                      <div className="relative z-10 flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-hama-gold text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">v{ver.version}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${ver.versionType === VersionType.MAJOR
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-white/5 text-white/40 border-white/10'
                            }`}>{ver.versionType}</span>
                        </div>
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{new Date(ver.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary mb-6 leading-relaxed font-light italic border-l border-hama-gold/20 pl-4">
                        "{ver.changeLog}"
                      </p>
                      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShieldCheck size={12} className="text-hama-gold/40" /> BY {ver.publishedBy}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to rollback to v${ver.version}? Current unsaved changes will be lost.`)) {
                              onRestore(ver);
                            }
                          }}
                          className="text-[9px] font-black text-red-500/60 uppercase tracking-widest flex items-center gap-2 hover:text-red-500 transition-colors bg-red-500/5 px-3 py-1.5 rounded-xl border border-red-500/10"
                        >
                          <ArchiveRestore size={14} /> Restore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === 'audit' && (
              <div className="space-y-0 relative animate-in fade-in duration-500">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-white/5"></div>
                {course.auditLog.map((log) => (
                  <div key={log.id} className="relative pl-10 py-4 group">
                    <div className="absolute left-[9px] top-6 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-hama-gold shadow-[0_0_10px_transparent] group-hover:shadow-hama-gold/40 transition-all duration-300"></div>
                    <div className="glass border-hama-gold/10 p-4 text-[10px] group-hover:border-hama-gold/20 transition-all bg-bg-secondary rounded-2xl relative overflow-hidden">
                      <div className="noise opacity-10" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-text-primary uppercase tracking-widest">{log.action}</span>
                          <span className="text-[8px] font-bold text-text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-text-secondary mb-3 leading-relaxed">{log.details}</p>
                        <div className="flex items-center gap-3">
                          <span className="bg-white/5 text-text-muted px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">{log.actorName}</span>
                          {log.versionContext && <span className="text-hama-gold/40 font-black tracking-widest uppercase text-[8px]">Version v{log.versionContext}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {course.auditLog.length === 0 && (
                  <div className="text-center py-20 opacity-20">
                    <FileClock size={48} className="mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Audit log is empty.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sticky Footer for Publish Button */}
          {activeTab === 'publish' && (
            <div className="p-8 border-t border-hama-gold/10 bg-bg-primary/95 backdrop-blur-xl sticky bottom-0 z-30">
              <button
                onClick={() => {
                  if (!releaseNotes) {
                    alert('Please enter a release log before publishing.');
                    return;
                  }
                  onPublish(releaseType, releaseNotes);
                }}
                className={`w-full py-5 text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${releaseNotes
                  ? 'bg-hama-gold shadow-hama-gold/20 hover:scale-[1.02] cursor-pointer'
                  : 'bg-white/10 text-white/20 border border-white/5 cursor-not-allowed'
                  }`}
              >
                <CheckCircle2 size={18} />
                Publish v{nextVersion}
              </button>
              {!releaseNotes && (
                <p className="text-[8px] font-black text-hama-gold/40 uppercase tracking-[0.2em] text-center mt-4 animate-pulse">
                  Release Log Required for Transmission
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionControlPanel;