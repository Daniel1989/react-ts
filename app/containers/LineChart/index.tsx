import React, { useEffect, useState } from 'react';
import styled from 'styles/styled-components';
import request from 'utils/request';
import LineChart from './chart';
import { Select, Input, Divider } from 'antd';

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
            <div style={{display: 'flex'}}>
                <Input defaultValue={num} onChange={onChange} style={{ width: 200 }}/>
                <Select value={type} style={{ width: 120 }} onChange={handleChange}>
                    <Option value={LineTypeEnum.DAILY}>日线</Option>
                    <Option value={LineTypeEnum.HOUR}>1小时线</Option>
                    <Option value={LineTypeEnum.MINUTE30}>30分钟线</Option>
                    <Option value={LineTypeEnum.MINUTE15}>15分钟线</Option>
                    <Option value={LineTypeEnum.MINUTE5}>5分钟线</Option>
                </Select>
            </div>
            
            <Divider />
            <div style={{textAlign: 'center'}}>
                {colArray.map((_s, index) => (
                    <LineChart type={type} goodList={goodList} contaierId={`container${index}`} />
                ))}
            </div>

        </DivWrapper>
    )
}

export default GoodChart;