import React, { useEffect, useState } from 'react';
import styled from 'styles/styled-components';
import { Chart } from '@antv/g2';
import request from 'utils/request';
import { Radio, Select, Switch } from 'antd';

const DivWrapper = styled.div`
    min-width: 768px;
`;

interface IProps {
    code: string,
    containerId: string,
}

const COMPANY_KEYWORD = '持仓'

const Line: React.FC<IProps> = (props) => {
    const [data, setData] = useState([]);
    const [type, setType] = useState('empty');
    const [companyList, setCompanyList] = useState([]);
    const [showOther, setShowOther] = useState(true);

    const [selectedCompanyList, setSelectedCompanyList] = useState([]);
    const { code, containerId } = props;
    useEffect(() => {
        const chart = new Chart({
            container: containerId,
            autoFit: true,
            // theme: 'dark',
            height: 500,
        });
        chart.scale(
            {
              nice: true,
            }
          );
        let source = data;
        switch (type) {
            case 'buy':
                source = data.filter((item) => !item.type.includes(COMPANY_KEYWORD) || item.type.includes('多单'))
                break;
            case 'sell':
                source = data.filter((item) => !item.type.includes(COMPANY_KEYWORD) || item.type.includes('空单'))
                break;
            case 'deal':
                source = data.filter((item) => !item.type.includes(COMPANY_KEYWORD) || item.type.includes('成交'))
                break;
            case 'empty':
                source = data.filter((item) => !item.type.includes(COMPANY_KEYWORD))
                break;
            default:
                break;
        }
        chart.data(source
            .filter((item)=> (showOther || item.type.includes(COMPANY_KEYWORD)))
            .filter((item)=>!item.type.includes(COMPANY_KEYWORD)  || selectedCompanyList.includes(item.type.substring(0,4))));
        chart.legend({
            // position: 'right',
            flipPage: false
        });
        chart.line().position('date*value').color('type');
        
        chart.render();
        return () => {
            chart && chart.destroy();
        }
    }, [data, type, selectedCompanyList, showOther])

    useEffect(() => {
        request(`http://127.0.0.1:8000/polls/line/${code}`).then((res: any) => {
            setData(res.data);
            const tempList = []
            res.data.forEach((item)=>{
                const tempName = item.type.substring(0,4);
                if(item.type.includes(COMPANY_KEYWORD) && !tempList.includes(tempName)) {
                    tempList.push(tempName)
                }
            })
            setCompanyList(tempList);
        }).catch((e) => {
            console.log(e);
        })
    }, [code])

    const handleChange = (value) => {
        setSelectedCompanyList(value)
    }
    return (
        <DivWrapper>
            <Radio.Group onChange={(e) => setType(e.target.value)} value={type}>
                <Radio value='empty'>不展示持仓</Radio>
                <Radio value='buy'>展示多单</Radio>
                <Radio value='sell'>展示空单</Radio>
                <Radio value='deal'>展示成交</Radio>
                <Radio value='all'>展示全部</Radio>
            </Radio.Group>
            <Switch style={{marginLeft: '12px'}} onChange={(e)=>setShowOther(e)} checkedChildren="展示非持仓信息" unCheckedChildren="不展示非持仓信息" checked={showOther} />
            <Select
                mode="multiple"
                allowClear
                placeholder="请选择机构"
                defaultValue={[]}
                onChange={handleChange}
                style={{width: '100%', marginTop: '12px', marginBottom: '12px'}}
                >
                {
                    companyList.map((item, index)=>(<Option key={index} value={item}>{item}</Option>))
                }
            </Select>
            <div id={containerId}></div>
        </DivWrapper>
    )
}

export default Line;