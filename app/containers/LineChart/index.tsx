import React, { useEffect, useState } from 'react';
import styled from 'styles/styled-components';
import request from 'utils/request';
import LineChart from './chart';
import Upload from './upload';
import { Select, Input, Divider, Switch } from 'antd';

const DivWrapper = styled.div`
  padding-top: 12px;
`;

interface IProps { }

enum LineTypeEnum {
    DAILY = 'daily',
    MINUTE5 = 'minute_5',
    MINUTE15 = 'minute_15',
    MINUTE30 = 'minute_30',
    HOUR = 'hour'
}

/**
 * 1. 加1分钟和1小时
 * @returns 
 */
const GoodChart: React.FC<IProps> = () => {
    const [goodList, setGoodList] = useState([]);
    const [showChart, setShowChart] = useState(true);
    const [online, setOnline] = useState(true);
    const [num, setNum] = useState(1);
    const [type, setType] = useState(LineTypeEnum.DAILY);
    useEffect(() => {
        request(`http://127.0.0.1:8000/polls/`).then((res: any) => {
            setGoodList(res);
        }).catch((e) => {
            console.log(e);
        })
    }, [])

    const colArray: number[] = [];
    for (let i = 0; i < num; i++) {
        colArray.push(1);
    }

    const onChange = (e) => {
        const newNum = parseInt(e.target.value);
        if (!isNaN(newNum) && newNum > 0) {
            setNum(newNum)
        }
    }

    const handleChange = (value) => {
        setType(value);
    }

    return (
        <DivWrapper>
            <div>
                <Upload />
            </div>
            <Divider />
            <div style={{display: 'flex', alignItems:'center'}}>
                <Input defaultValue={num} onChange={onChange} style={{ width: 200 }}/>
                <Select value={type} style={{ width: 120 }} onChange={handleChange}>
                    <Option value={LineTypeEnum.DAILY}>日线</Option>
                    <Option value={LineTypeEnum.HOUR}>1小时线</Option>
                    <Option value={LineTypeEnum.MINUTE30}>30分钟线</Option>
                    <Option value={LineTypeEnum.MINUTE15}>15分钟线</Option>
                    <Option value={LineTypeEnum.MINUTE5}>5分钟线</Option>
                </Select>
                <Switch style={{marginLeft: '12px'}} onChange={(e)=>setShowChart(e)} checkedChildren="展示图表" unCheckedChildren="关闭图表" checked={showChart} />
                <Switch style={{marginLeft: '12px'}} onChange={(e)=>setOnline(e)} checkedChildren="使用在线数据" unCheckedChildren="不使用在线数据" checked={online} />
            </div>
            
            <Divider />
            <div style={{textAlign: 'center'}}>
                {colArray.map((_s, index) => (
                    <LineChart type={type} goodList={goodList} contaierId={`container${index}`} showChart={showChart} online={online}/>
                ))}
            </div>

        </DivWrapper>
    )
}

export default GoodChart;