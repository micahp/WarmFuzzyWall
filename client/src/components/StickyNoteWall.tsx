import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import StickyNote from "./StickyNote";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface StickyNoteWallProps {
  onNoteClick: (note: Note) => void;
}

type NotesResponse = {
  notes: Note[];
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
};

export default function StickyNoteWall({ onNoteClick }: StickyNoteWallProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Fetch notes with infinite scroll support
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery<NotesResponse>({
    queryKey: ['/api/notes'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/notes?page=${pageParam}&limit=8`);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    refetchOnWindowFocus: false, // Prevent automatic refetching which could reset the list
  });

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Show scroll button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Display loading skeletons while fetching initial notes
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="min-h-[150px]">
            <Skeleton className="h-[150px] w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  // Display error message if fetching notes fails
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Notes</h2>
        <p className="text-gray-800 mb-4">
          Unable to load the warm and fuzzy notes. Please try again later.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // Get all notes from all pages (ensure we combine them properly)
  const allNotes = data?.pages?.flatMap(page => page.notes) || [];

  // Display empty state if no notes exist
  if (!data?.pages || allNotes.length === 0) {
    return (
      <div className="text-center p-8 bg-blue-50 rounded-lg max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">No Warm Fuzzies Yet</h2>
        <p className="text-gray-800">
          Be the first to add a warm and fuzzy note! Click the "Add Warm Fuzzy" button below.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
        {allNotes.map((note) => (
          <StickyNote 
            key={note.id} 
            note={note} 
            onNoteClick={onNoteClick} 
            animation={false} // Animation only for newly loaded notes
          />
        ))}
        
        {/* Loading indicator for next page */}
        {isFetchingNextPage && (
          <div className="col-span-full flex justify-center py-4">
            <div className="flex space-x-2 items-center">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <span className="text-blue-500 font-medium ml-2">Loading more notes...</span>
            </div>
          </div>
        )}
        
        {/* Intersection observer target */}
        {hasNextPage && <div ref={loaderRef} className="h-4 w-full col-span-full"></div>}
      </div>

      {/* Scroll to top button */}
      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-24 right-8 rounded-full h-12 w-12 shadow-lg"
          aria-label="Scroll to top"
        >
          <ChevronDown className="h-6 w-6 transform rotate-180" />
        </Button>
      )}
    </>
  );
}
