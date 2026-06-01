'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Search, Sparkles, Award, BookmarkCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScholarships } from '@/hooks/useScholarships';
import { useUserProfile } from '@/hooks/useUserProfile';
import ScholarshipFilter from '@/components/scholarships/ScholarshipFilter';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import EmptyState from '@/components/shared/EmptyState';
import type { ScholarshipFilters, Scholarship } from '@/types';

const emptyFilters: ScholarshipFilters = {
  state: '',
  course: '',
  incomeRange: '',
  category: '',
  gender: '',
};

function calculateMatchPercentage(scholarship: Scholarship, profile: any): number {
  if (!profile) return 50; // default baseline if no profile loaded yet

  let score = 0;
  let maxScore = 0;

  // 1. Course Match (25 Points)
  maxScore += 25;
  const userCourse = profile.course ? profile.course.toLowerCase() : '';
  const eligibleCourses = scholarship.eligibility.courses.map((c) => c.toLowerCase());
  if (userCourse) {
    if (
      eligibleCourses.includes(userCourse) ||
      eligibleCourses.includes('all') ||
      eligibleCourses.includes('all india') ||
      eligibleCourses.some((c) => userCourse.includes(c) || c.includes(userCourse))
    ) {
      score += 25;
    }
  } else {
    score += 15; // partial score if unconfigured
  }

  // 2. State Match (25 Points)
  maxScore += 25;
  const userState = profile.state ? profile.state.toLowerCase() : '';
  const eligibleStates = scholarship.eligibility.states.map((s) => s.toLowerCase());
  if (userState) {
    if (eligibleStates.includes(userState) || eligibleStates.includes('all india')) {
      score += 25;
    }
  } else {
    score += 15; // partial score if unconfigured
  }

  // 3. Category Match (25 Points)
  maxScore += 25;
  const userCategory = (profile.category || 'General').toLowerCase();
  const eligibleCategories = scholarship.eligibility.categories.map((c) => c.toLowerCase());
  if (eligibleCategories.includes(userCategory) || eligibleCategories.includes('general')) {
    score += 25;
  }

  // 4. Gender Match (25 Points)
  maxScore += 25;
  const userGender = (profile.gender || 'all').toLowerCase();
  const eligibleGender = scholarship.eligibility.gender.toLowerCase();
  if (eligibleGender === 'all' || eligibleGender === userGender) {
    score += 25;
  }

  return Math.round((score / maxScore) * 100);
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="h-[380px] rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
              <div className="h-8 bg-white/10 rounded w-20" />
            </div>
            <div className="h-8 bg-white/5 rounded w-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-2 bg-white/5 rounded w-1/4" />
              <div className="flex gap-2">
                <div className="h-5 bg-white/5 rounded w-12" />
                <div className="h-5 bg-white/5 rounded w-16" />
              </div>
            </div>
          </div>
          <div className="h-10 bg-white/10 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

export default function ScholarshipsPage() {
  const { scholarships, savedScholarshipIds, isLoading, saveScholarship, unsaveScholarship } =
    useScholarships();
  const { profile } = useUserProfile();

  const [filters, setFilters] = useState<ScholarshipFilters>(emptyFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Compute matches, filtering, and sorting
  const processedScholarships = useMemo(() => {
    let items = scholarships.map((s) => ({
      ...s,
      matchPercentage: calculateMatchPercentage(s, profile),
    }));

    // Filter by search query
    if (searchQuery.trim()) {
      const escapedQuery = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedQuery, 'i');
      items = items.filter(
        (s) =>
          searchRegex.test(s.name) ||
          searchRegex.test(s.provider) ||
          (s.tags && s.tags.some((tag) => searchRegex.test(tag)))
      );
    }

    // Filter by saved only
    if (showSavedOnly) {
      items = items.filter((s) => savedScholarshipIds.includes(s.id));
    }

    // Filter by dropdown selections
    items = items.filter((s) => {
      if (
        filters.state &&
        !s.eligibility.states.includes('All India') &&
        !s.eligibility.states.includes(filters.state)
      ) {
        return false;
      }

      if (filters.course && !s.eligibility.courses.includes(filters.course)) {
        return false;
      }

      if (filters.category && !s.eligibility.categories.includes(filters.category)) {
        return false;
      }

      if (
        filters.gender &&
        filters.gender.toLowerCase() !== 'all' &&
        s.eligibility.gender !== 'all' &&
        s.eligibility.gender !== filters.gender.toLowerCase()
      ) {
        return false;
      }

      return true;
    });

    return items;
  }, [scholarships, profile, searchQuery, showSavedOnly, savedScholarshipIds, filters]);

  // Recommended Scholarships: Top profile matches sorted descending (>= 75% match score)
  const recommendedScholarships = useMemo(() => {
    // Only show recommendations if user has a configured profile parameter
    const profileConfigured = profile?.course || profile?.state;
    if (!profileConfigured) return [];
    
    return processedScholarships
      .filter((s) => s.matchPercentage >= 75)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);
  }, [processedScholarships, profile]);

  // Featured Scholarships: Flagged as featured in Firestore
  const featuredScholarships = useMemo(() => {
    return processedScholarships.filter((s) => s.featured).slice(0, 3);
  }, [processedScholarships]);

  const handleToggleSave = async (id: string) => {
    if (savedScholarshipIds.includes(id)) {
      await unsaveScholarship(id);
    } else {
      await saveScholarship(id);
    }
  };

  const isProfileIncomplete = !profile?.course || !profile?.state;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-16 bg-white/5 rounded-xl w-1/3 animate-pulse" />
        <div className="h-32 bg-white/5 rounded-2xl w-full animate-pulse" />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <GraduationCap className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Scholarship Matcher</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time scholarship matching based on your student profile.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Incomplete Notification Banner */}
      {isProfileIncomplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 flex items-start gap-3"
        >
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Personalize Your Matches!</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Complete your course and state fields in{' '}
              <a href="/settings" className="text-blue-400 hover:underline font-medium">
                Settings
              </a>{' '}
              to unlock the intelligent compatibility matchmaking engine!
            </p>
          </div>
        </motion.div>
      )}

      {/* Recommended For You Section */}
      {recommendedScholarships.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-200">Recommended For You</h2>
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
              Best Match
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedScholarships.map((s, i) => (
              <ScholarshipCard
                key={`rec-${s.id}`}
                scholarship={s}
                index={i}
                isSaved={savedScholarshipIds.includes(s.id)}
                onToggleSave={() => handleToggleSave(s.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Featured Scholarships Section */}
      {featuredScholarships.length > 0 && recommendedScholarships.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            <h2 className="text-lg font-bold text-slate-200">Featured Scholarships</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredScholarships.map((s, i) => (
              <ScholarshipCard
                key={`feat-${s.id}`}
                scholarship={s}
                index={i}
                isSaved={savedScholarshipIds.includes(s.id)}
                onToggleSave={() => handleToggleSave(s.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Search & Filters Controls */}
      <div className="space-y-6">
        <div className="border-t border-white/[0.04] pt-6">
          <ScholarshipFilter
            filters={filters}
            onChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showSavedOnly={showSavedOnly}
            onSavedOnlyChange={setShowSavedOnly}
          />
        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            <p className="text-sm text-slate-400">
              Showing <span className="font-bold text-slate-200">{processedScholarships.length}</span>{' '}
              {processedScholarships.length === 1 ? 'scholarship' : 'scholarships'}
            </p>
          </div>
          {showSavedOnly && (
            <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold bg-violet-500/5 px-2.5 py-1 rounded-lg border border-violet-500/10">
              <BookmarkCheck className="w-3.5 h-3.5" />
              Bookmarked View Active
            </div>
          )}
        </div>

        {/* Explore/All Scholarships Grid */}
        <AnimatePresence mode="wait">
          {processedScholarships.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {processedScholarships.map((scholarship, i) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  index={i}
                  isSaved={savedScholarshipIds.includes(scholarship.id)}
                  onToggleSave={() => handleToggleSave(scholarship.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <EmptyState
                icon={<GraduationCap className="w-8 h-8 text-slate-500" />}
                title={showSavedOnly ? "No saved scholarships" : "No scholarships match"}
                description={
                  showSavedOnly
                    ? "Bookmark your first scholarship using the save icon on any scholarship card to view them here."
                    : "Try adjusting your filters or typing different keywords to discover more opportunities."
                }
                action={
                  <button
                    onClick={() => {
                      setFilters(emptyFilters);
                      setSearchQuery('');
                      setShowSavedOnly(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 hover:bg-white/[0.06] hover:text-slate-200 transition-colors"
                  >
                    Reset All Filters
                  </button>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
