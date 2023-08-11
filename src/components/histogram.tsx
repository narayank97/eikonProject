import React from "react";

interface IHistogramProps {
    data: [string, number][];
    width: number;
    height: number;
    barColor: string;
    xAxis: string;
}

export const Histogram: React.FC<IHistogramProps> = ({ data, width, height, barColor, xAxis }) => {
    const x0 = 25;
    const xAxisLength = width - x0 * 2;

    const y0 = 70;
    const yAxisLength = height - y0 * 2;

    const xAxisY = y0 + yAxisLength;
    const barWidth = (width - 75) / data.length;

    const inflationData = data.map(function (dataPoint) {
        return dataPoint[1];
    });
    const maxValue = Math.max(...inflationData);
    const scaleFactor = (height / maxValue) - 1;

    return (
        <svg width={width} height={height}>

            {data.map((value, index) => (
                <g key={'group' + index}>
                    < rect
                        key={index}
                        x={(index * barWidth) + 25}
                        y={(height - value[1] * scaleFactor) - 70}
                        width={barWidth - 1}
                        height={value[1] * scaleFactor}
                        fill={barColor}
                    >
                        <title key={'hover' + index}>{`Inflation rate was ${value[1]} in ${value[0]}`}</title>
                    </rect>
                    <text
                        key={'bar' + index}
                        x={(index * barWidth) + (barWidth / 2) + 25}
                        y={height - 67}
                        fontFamily="Verdana"
                        fontSize={8}
                        fill="black"
                        writingMode="tb"
                    >
                        {value[0]}
                    </text>

                </g>
            ))
            }
            {/* X axis */}
            <line key={'xaxis'} x1={x0} y1={xAxisY} x2={x0 + xAxisLength} y2={xAxisY} stroke="black" />
            <text key={'xaxisTitle'} x={width / 2} y={height} fontSize={16} textAnchor="middle">
                {xAxis}
            </text>

            {/* Y axis */}
            <line key={'yaxis'} x1={x0} y1={y0} x2={x0} y2={y0 + yAxisLength} stroke="black" />
            <text key={'yaxisTitle'} x={x0 + 40} y={y0 - 8} textAnchor="middle" fontSize={17}>
                Inflation Rate (%)
            </text>
            {/* Title */}
            <text key={'title'} x={width / 2} y={20} fontSize={25} fontWeight={800} textAnchor="middle">
                Inflation Rate over the {xAxis}
            </text>
        </svg >
    );
};

export default Histogram;