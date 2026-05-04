import { Line, LineChart, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, dataKey = 'value', color, height = 28, className = '' }) {
  if (!data || data.length === 0) return null;
  const stroke = color ?? 'var(--color-turquoise-500)';
  const series = typeof data[0] === 'number' ? data.map((v, i) => ({ i, [dataKey]: v })) : data;
  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Sparkline;
