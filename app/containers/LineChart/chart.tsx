import React, { useEffect, useState } from 'react';
import styled from 'styles/styled-components';
import { Chart } from '@antv/g2';
import request from 'utils/request';
import { Switch, Collapse, Input, Select } from 'antd';
import Line from './line';

const { Panel } = Collapse;
const { Option } = Select;

const DivWrapper = styled.div`
  padding-top: 20px;
  margin-bottom: 20px;
  min-width: 768px;
  display: inline-block;
`;

const InputWrapper = styled.div`
  margin-bottom: 12px;
  display:flex;
  align-items: center;
`;


const ResultWrapper = styled.div`
  display:flex;
  flex-direction: row;
`;

const PredictWrapper = styled.div`
`;

interface IProps {
    goodList: string[],
    contaierId: string,
    type: string,
    showChart: boolean,
    online: boolean,
    main_good_no_map: {[key:string]: string}
}

/**
 * 1. 加1分钟和1小时
 * @returns 
 */
const LineChart: React.FC<IProps> = (props) => {
    const { goodList, contaierId, type, online, main_good_no_map } = props;
    const [data, setData] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [predictList, setPredictList] = useState([]);
    const [predictData, setPredictData] = useState(0);
    const [showChart, setShowChart] = useState(props.showChart);

    const [good, setGood] = useState("RU");
    const [year, setYear] = useState("22");
    const [month, setMonth] = useState("09");
    const [goodCode, setGoodCode] = useState(good + year + month);

    useEffect(() => {
        request(`http://127.0.0.1:8000/polls/${online ? 'detail' : 'detaildb'}/${goodCode}/${type}`, {
            method: 'post',
            body: JSON.stringify({ data: predictData, source: online ? 'online' : 'db' })
        }).then((res: any) => {
            setData(res.trendData);
            setPredictList(res.predict);
            setResultList(res.result.filter((item) => item.status === 'close'));
        }).catch((e) => {
            console.log(e);
        })
    }, [goodCode, predictData, type, online])

    useEffect(() => {
        let chart: null | Chart = null;
        if (data.length && showChart) {
            chart = new Chart({
                container: contaierId,
                autoFit: true,
                height: 500,
                margin: [20, 40]
            } as any);

            chart.data(data);
            chart.legend({
                position: 'bottom'
            });
            
            chart
                .interval()
                .adjust('stack')
                .position('date*typeValue')
                .size(8)
                .color('type', (xVal: string) => {
                    switch (xVal) {
                        case '上升趋势':
                            return '#ff0000';
                        case '下降趋势':
                            return '#2f7a00';
                        case '自然回升':
                            return 'rgba(255,0,0, .5)';
                        case '自然回落':
                            return 'rgba(47,122,0, .5)';
                        case '次级回升':
                            return 'rgba(255,0,0, .2)';
                        case '次级回落':
                            return 'rgba(47,122,0, .2)';
                        default:
                            return "#000"
                    }
                })
            // .color('type', ['#ff0000', 'rgba(47,122,0, .5)', '#2f7a00', 'rgba(255,0,0, .5)', 'rgba(47,122,0, .2)', 'rgba(255,0,0, .2)' ]);
            chart.line().position('date*value').color('yellow');
            chart.line().position('date*closeValue').color('#fff');
            chart.axis('typeValue', false);
            chart.axis('closeValue', {
                position:'left'
            });
            chart.axis('value', {
                position: 'left'
            });

            chart.render();
        }
        return () => {
            chart && chart.destroy();
        }
    }, [data, showChart])

    useEffect(() => {
        setGoodCode(good + year + month);
    }, [good, year, month])

    const handleChange = (value, type) => {
        if (type === 'good') {
            setGood(value)
            if(main_good_no_map[value]) {
                setYear(main_good_no_map[value].substring(0,2))
                setMonth(main_good_no_map[value].substring(2))
            }
        } else if (type === 'year') {
            setYear(value)
        } else if (type === 'month') {
            setMonth(value)
        }
    }

    const yearList: string[] = ["15", "16", "18", "19", "20", "21", "22", "23", "24"];
    const monthList: string[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    return (
        <DivWrapper>
            <InputWrapper>
                <Select filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                } showSearch optionFilterProp="children" defaultValue={good} style={{ width: 120 }} onChange={(e) => handleChange(e, 'good')}>
                    {
                        goodList.map((s) => <Option value={s}>{s}</Option>)
                    }
                </Select>
                <Select value={year} style={{ width: 120 }} onChange={(e) => handleChange(e, 'year')}>
                    {
                        yearList.map((s) => <Option value={s}>{s}</Option>)
                    }
                </Select>
                <Select value={month} style={{ width: 120 }} onChange={(e) => handleChange(e, 'month')}>
                    {
                        monthList.map((s) => <Option value={s}>{s}</Option>)
                    }
                </Select>
            </InputWrapper>
            <InputWrapper>
                <Input style={{ width: '120px' }} onBlur={(e) => {
                    const newNum = parseInt(e.target.value)
                    setPredictData(isNaN(newNum) ? 0 : newNum)
                }} defaultValue={predictData} />
                <Switch style={{ marginLeft: '12px' }} onChange={(e) => setShowChart(e)} checkedChildren="展示图表" unCheckedChildren="关闭图表" defaultChecked />
            </InputWrapper>
            <div style={{display:"flex"}}>
                <div style={{marginBottom: '20px', minWidth: "768px"}}>
                    <div id={contaierId}></div>
                    <Collapse defaultActiveKey={[]}>
                        <Panel header="预测点位" key="1">
                            <PredictWrapper>
                                {
                                    predictList.map((s) => {
                                        return (
                                            <div>如果价格达到 <span style={{ fontWeight: 'bold' }}>{s.value}</span>, 则进入<span style={{ color: s.type.includes('升') ? 'red' : 'green' }}>{s.desc || s.type}</span></div>
                                        )
                                    })
                                }
                            </PredictWrapper>
                        </Panel>
                        <Panel header="历史盈亏" key="2">
                            <ResultWrapper>
                                <div style={{ marginRight: '12px' }}>
                                    {
                                        resultList.filter((item) => item.type === 'OPEN_BUY').map((item) => {
                                            return (
                                                <div>
                                                    <span>开多&nbsp;</span>
                                                    <span>开仓日期:&nbsp;{item.startDate}&nbsp;</span>
                                                    <span>平仓日期:&nbsp;{item.closeDate}&nbsp;</span>
                                                    <span style={{ color: item.diffValue > 0 ? 'red' : 'green' }}>&nbsp;{item.diffValue > 0 ? '盈利' : '亏损'}:&nbsp;{item.diffValue}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div>
                                    {
                                        resultList.filter((item) => item.type === 'OPEN_SELL').map((item) => {
                                            return (
                                                <div>
                                                    <span>开空&nbsp;</span>
                                                    <span>开仓日期:&nbsp;{item.startDate}&nbsp;</span>
                                                    <span>平仓日期:&nbsp;{item.closeDate}&nbsp;</span>
                                                    <span style={{ color: item.diffValue > 0 ? 'red' : 'green' }}>&nbsp;{item.diffValue > 0 ? '盈利' : '亏损'}:&nbsp;{item.diffValue}</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </ResultWrapper>
                        </Panel>
                    </Collapse>
                </div>
                    {
                        online ? null : (
                            <Line code={goodCode} containerId={contaierId+"_line"}/>
                        )
                    }
            </div>
            
        </DivWrapper>
    )
}

export default LineChart;