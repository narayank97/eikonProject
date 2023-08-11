
import React, { useEffect, useState } from "react";
import env from "react-dotenv";
import { Histogram } from "./histogram";

const MainComponent: React.FC = () => {
    const [inflationData, setInflationData] = useState<[string, number][]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [monthly, setMonthly] = useState(true);
    const [clear, setClear] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const api_key = env.API_KEY;
            // using proxy to get around cors issues
            const proxy = 'https://api.allorigins.win/raw?url=';
            await fetch(`${proxy}https://data.nasdaq.com/api/v3/datasets/RATEINF/CPI_USA.json?start_date=${startDate}&end_date=${endDate}&api_key=${api_key}`)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                    if (monthly) {
                        // Formatting data for months
                        const currentData = data.dataset.data;
                        const monthAbbrevs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        currentData.map((inflationDataPoint: [string, number]) => {
                            const currentMonth = Number(inflationDataPoint[0].substring(5, 7));
                            const year = inflationDataPoint[0].substring(0, 4);
                            const formattedDate = `${monthAbbrevs[currentMonth - 1]} ${year}`;
                            inflationDataPoint[0] = formattedDate;
                            inflationDataPoint[1] = Number(inflationDataPoint[1].toFixed(3));
                            return inflationDataPoint;
                        });

                        setInflationData(data.dataset.data.reverse());
                    } else {
                        // Formatting data to for annual visualization
                        const currentData = data.dataset.data;
                        const yearToInflationData = new Map<string, number[]>();
                        for (let i = 0; i < currentData.length; i++) {
                            let inflationDataPoint = currentData[i];
                            const year = inflationDataPoint[0].substring(0, 4);
                            const inflationRate = inflationDataPoint[1];
                            if (yearToInflationData.get(year)) {
                                yearToInflationData.get(year)?.push(inflationRate);
                            }
                            else {
                                yearToInflationData.set(year, [inflationRate]);
                            }
                        }
                        const annualData: [string, number][] = [];
                        for (const yearData of yearToInflationData) {
                            const averageInflationForYear = yearData[1].reduce((a, b) => a + b) / yearData[1].length;
                            annualData.push([yearData[0], Number(averageInflationForYear.toFixed(3))])
                        }
                        setInflationData(annualData.reverse());
                    }
                });
        }
        if (startDate !== "" && endDate !== "" && !clear) {
            fetchData()
                .catch(console.error);
        }
        if (clear) {
            setInflationData([]);
            setStartDate("");
            setEndDate("");
            setClear(false);
        }
    }, [startDate, endDate, monthly, clear]);

    return (
        <div>
            <div>Start Date: <input max={endDate || "2023-06-30"} type="date" id="startDate" name="startDate" onChange={e => setStartDate(e.target.value)} value={startDate} /></div>
            <div>End Date: <input min={startDate} max="2023-06-30" type="date" id="endDate" name="endDate" onChange={e => setEndDate(e.target.value)} value={endDate} /></div>
            <div>
                Duration Type:
                <select name="durationType" id="durationType" onChange={e => setMonthly(e.target.value === "monthly")}>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Anually</option>
                </select>
            </div>
            <button onClick={() => setClear(true)}>
                Clear
            </button>

            <div style={{ marginTop: "5%" }}>
                <Histogram data={inflationData} width={1000} height={600} barColor="steelblue" xAxis={monthly ? 'Months' : 'Years'} />
            </div>
        </div>
    );
}
export default MainComponent;