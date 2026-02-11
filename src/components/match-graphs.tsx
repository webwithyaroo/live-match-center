'use client';

import { MatchStats } from "@/types/match";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Activity, Target, Flag, Square } from "lucide-react";

type MatchGraphsProps = {
  statistics: MatchStats;
  homeTeamShort?: string;
  awayTeamShort?: string;
};

// Custom tooltip component (defined outside render)
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * MatchGraphs Component
 * 
 * Premium statistics visualization with animated graphs
 * Features bar charts for all statistics with dark theme and orange accents
 */
export default function MatchGraphs({
  statistics,
  homeTeamShort = "Home",
  awayTeamShort = "Away"
}: MatchGraphsProps) {

  // Prepare data for possession chart
  const possessionData = [
    {
      name: 'Possession',
      [homeTeamShort]: statistics.possession.home,
      [awayTeamShort]: statistics.possession.away,
    }
  ];

  // Prepare data for shots chart
  const shotsData = [
    {
      name: 'Total Shots',
      [homeTeamShort]: statistics.shots.home,
      [awayTeamShort]: statistics.shots.away,
    },
    {
      name: 'On Target',
      [homeTeamShort]: statistics.shotsOnTarget.home,
      [awayTeamShort]: statistics.shotsOnTarget.away,
    }
  ];

  // Prepare data for other stats
  const otherStatsData = [
    {
      name: 'Corners',
      [homeTeamShort]: statistics.corners.home,
      [awayTeamShort]: statistics.corners.away,
    },
    {
      name: 'Fouls',
      [homeTeamShort]: statistics.fouls.home,
      [awayTeamShort]: statistics.fouls.away,
    }
  ];

  // Prepare data for cards
  const cardsData = [
    {
      name: 'Yellow Cards',
      [homeTeamShort]: statistics.yellowCards.home,
      [awayTeamShort]: statistics.yellowCards.away,
    },
    {
      name: 'Red Cards',
      [homeTeamShort]: statistics.redCards.home,
      [awayTeamShort]: statistics.redCards.away,
    }
  ];

  const chartMargin = { top: 10, right: 10, left: -20, bottom: 0 };

  return (
    <div 
      className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-lg p-6"
      role="region"
      aria-label="Match Statistics Graphs"
    >
      <h3 className="font-bold text-2xl mb-6 text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-[#FF5500]" aria-hidden="true" />
        Match Statistics
      </h3>

      <div className="space-y-8">
        {/* Possession Chart */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF5500]" />
            Possession
          </h4>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart 
              data={possessionData} 
              layout="vertical"
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={homeTeamShort} 
                fill="#FF5500" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey={awayTeamShort} 
                fill="#4B5563" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shots Chart */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF5500]" />
            Shots
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart 
              data={shotsData} 
              layout="vertical"
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
              <XAxis 
                type="number"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={homeTeamShort} 
                fill="#FF5500" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey={awayTeamShort} 
                fill="#4B5563" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Other Stats Chart */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#FF5500]" />
            Corners & Fouls
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart 
              data={otherStatsData} 
              layout="vertical"
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
              <XAxis 
                type="number"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={homeTeamShort} 
                fill="#FF5500" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey={awayTeamShort} 
                fill="#4B5563" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cards Chart */}
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Square className="w-4 h-4 text-yellow-400" fill="currentColor" />
            Cards
          </h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart 
              data={cardsData} 
              layout="vertical"
              margin={chartMargin}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
              <XAxis 
                type="number"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name"
                stroke="#666666"
                tick={{ fill: '#9E9E9E', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={homeTeamShort} 
                fill="#FF5500" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey={awayTeamShort} 
                fill="#4B5563" 
                radius={[0, 4, 4, 0]}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
