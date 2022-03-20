import React, { useEffect, useState } from 'react';
import styled from 'styles/styled-components';
import { Chart } from '@antv/g2';
import request from 'utils/request';
import { Collapse, Input, Select } from 'antd';

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
  width: 120px;
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
 }

/**
 * 1. 加1分钟和1小时
 * @returns 
 */
const DEFAULT_GOOD = 'AG2206'
const LineChart: React.FC<IProps> = (props) => {
    const { goodList, contaierId, type } = props;
    const [data, setData] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [goodCode, setGoodCode] = useState(DEFAULT_GOOD);
    const [predictList, setPredictList] = useState([]);
    const [predictData, setPredictData] = useState(0);

    useEffect(() => {
        request(`http://127.0.0.1:8000/polls/${goodCode}/${type}`, {
            method: 'post',
            body: JSON.stringify({ data: predictData })
        }).then((res: any) => {
            setData(res.trendData);
            setPredictList(res.predict);
            setResultList(res.result.filter((item) => item.status === 'close'));
        }).catch((e) => {
            console.log(e);
        })
    }, [goodCode, predictData, type])

    useEffect(() => {
        let chart: null | Chart = null;
        if (data.length) {
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
            chart.axis('typeValue', false);
            // chart.interaction('active-region');
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
            chart.render();
        }
        return () => {
            chart && chart.destroy();
        }
    }, [data])

    const handleChange = (value) => {
        setGoodCode(value);
    }
    return (
        <DivWrapper>
            <InputWrapper>
                <Select defaultValue={DEFAULT_GOOD} style={{ width: 120 }} onChange={handleChange}>
                    {
                        goodList.map((s)=><Option value={s}>{s}</Option>)
                    }
                </Select>
            </InputWrapper>
            <InputWrapper>
                <Input onBlur={(e) => {
                    const newNum = parseInt(e.target.value)
                    setPredictData(isNaN(newNum) ? 0 : newNum)
                }} defaultValue={predictData} />
            </InputWrapper>
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
        </DivWrapper>
    )
}

export default LineChart;