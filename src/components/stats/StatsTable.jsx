import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Full stat columns matching your requested format
export const STAT_COLUMNS = [
  { key: "fgMade",       label: "FGM" },
  { key: "fgAttempted",  label: "FGA" },
  { key: "fgPct",        label: "FG%",  pct: true },
  { key: "fg3Made",      label: "3PTM" },
  { key: "fg3Attempted", label: "3PTA" },
  { key: "fg3Pct",       label: "3PT%", pct: true },
  { key: "ftMade",       label: "FTM" },
  { key: "ftAttempted",  label: "FTA" },
  { key: "ftPct",        label: "FT%",  pct: true },
  { key: "assists",      label: "AST" },
  { key: "orb",          label: "OFFR" },
  { key: "drb",          label: "DEFR" },
  { key: "rebounds",     label: "TOTR" },
  { key: "fouls",        label: "Fouls" },
  { key: "blocks",       label: "BS" },
  { key: "drb",          label: "Def",  alias: true },
  { key: "steals",       label: "Steal" },
  { key: "turnovers",    label: "TO" },
  { key: "techs",        label: "Tech" },
  { key: "points",       label: "PTS" },
];

// Deduplicated display columns (no alias duplicates)
export const DISPLAY_COLUMNS = [
  { key: "fgMade",       label: "FGM" },
  { key: "fgAttempted",  label: "FGA" },
  { key: "fgPct",        label: "FG%",  pct: true },
  { key: "fg3Made",      label: "3PTM" },
  { key: "fg3Attempted", label: "3PTA" },
  { key: "fg3Pct",       label: "3PT%", pct: true },
  { key: "ftMade",       label: "FTM" },
  { key: "ftAttempted",  label: "FTA" },
  { key: "ftPct",        label: "FT%",  pct: true },
  { key: "assists",      label: "AST" },
  { key: "orb",          label: "OFF REB" },
  { key: "drb",          label: "DEF REB" },
  { key: "rebounds",     label: "TOT REB" },
  { key: "fouls",        label: "Fouls" },
  { key: "blocks",       label: "BLK" },
  { key: "steals",       label: "STL" },
  { key: "turnovers",    label: "TO" },
  { key: "techs",        label: "Tech" },
  { key: "points",       label: "PTS" },
];

export default function StatsTable({ rows, onRowClick, highlightKey = "points" }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground whitespace-nowrap sticky left-0 bg-secondary/50 z-10">
                Player
              </TableHead>
              {DISPLAY_COLUMNS.map(col => (
                <TableHead key={col.key + col.label} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground whitespace-nowrap text-right">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={DISPLAY_COLUMNS.length + 1} className="text-center py-8 text-muted-foreground">
                  No data yet
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("hover:bg-secondary/30", onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  <TableCell className="font-bold text-foreground whitespace-nowrap sticky left-0 bg-card z-10">
                    <span className="text-primary mr-1.5">#{row.number}</span>
                    {row.name}
                    {row.classification !== undefined && (
                      <span className="text-xs text-muted-foreground ml-1.5">({row.classification})</span>
                    )}
                  </TableCell>
                  {DISPLAY_COLUMNS.map(col => (
                    <TableCell
                      key={col.key + col.label}
                      className={cn(
                        "text-right tabular-nums",
                        col.key === "points" && "font-black text-primary text-base",
                        col.pct && "text-muted-foreground"
                      )}
                    >
                      {col.pct ? `${row.stats[col.key]}%` : row.stats[col.key] ?? 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}