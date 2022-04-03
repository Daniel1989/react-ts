import React, { useState, useEffect } from 'react';
import styled from 'styles/styled-components';
import { Table, Calendar, message, Button, Select, Upload, Radio, Input, Collapse, Divider } from 'antd';
import request from 'utils/request';

const { Panel } = Collapse;

const DivWrapper = styled.div`
  padding-top: 12px;
  width: 480px;
`;

interface IProps { }

/**
 * 1. 加1分钟和1小时
 * @returns 
 */
const Uploader: React.FC<IProps> = () => {
  const [place, setPlace] = useState('sh');
  const [type, setType] = useState('record');
  const [text, setText] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeType, setTimeType] = useState('60');
  const [goodList, setGoodList] = useState([]);
  const props = {
    name: 'file',
    action: `http://127.0.0.1:8000/polls/upload/${place}/${type}`,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };
  const onChange = (e) => {
    setText(e.target.value)
  }
  const submit = () => {
    if(!dateStr) {
      message.error("未设置时间，请重新选择并提交")
      return;
    }
    request(`http://127.0.0.1:8000/polls/upload/${place}/${type}`, {
      method: 'post',
      body: JSON.stringify({ data: text, place, date: dateStr })
    }).then((res: any) => {
      if (res.success) {
        message.success("提交成功")
      } else {
        message.error("提交失败")
      }
      setText('');
    }).catch((e) => {
      message.error("提交失败")
      console.log(e);
      setText('');
    })
  }


  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'))
    setDateStr(value.format('YYYY-MM-DD'))
  }
  const table_data:any[] = []
  for(let i =0; i<70;i++) {
    table_data.push({
      key: (i+1).toString(),
      code: '',
      amount: ''
    })
  }

  const columns = [
    {
      title: '品种编号',
      dataIndex: 'code',
      key: 'code',
      render: (_text, _record, index)=> {
        return (
          <Select showSearch optionFilterProp="children" style={{width:'120px'}} onChange={(e)=>{
            const selectedCodeList = table_data.map((item)=>item.code);
            if(selectedCodeList.includes(e)){
              message.error(e+"已被选择，请不要重复选择")
            } else {
              table_data[index]["code"]=e
            }
          }}>
            {goodList.map((item)=>(<Option value={item.code}>{`${item.name}(${item.code})`}</Option>))}
          </Select>
        )
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (_text, _record, index)=> {
        return <Input defaultValue='' onChange={(e)=>{
          table_data[index]["amount"] = e.target.value;
        }} />  
      }
    },
  ];

  useEffect(()=>{
    request(`http://127.0.0.1:8000/polls/good/list`).then((res: any) => {
      setGoodList(res)
    })
  },[])

  const submitMoneyFlow = () => {
    request(`http://127.0.0.1:8000/polls/upload/${place}/money`, {
      method: 'post',
      body: JSON.stringify({ data: table_data.filter(item => item["code"]) })
    }).then((res: any) => {
      if (res.success) {
        message.success("提交成功")
      } else {
        message.error("提交失败")
      }
    }).catch((e) => {
      message.error("提交失败")
      console.log(e);
    })
  }

  const syncSina = () => {
    request(`http://127.0.0.1:8000/polls/syncsina/${timeType}`).then((res: any) => {
      if (res.success) {
        message.success("同步成功")
      } else {
        message.error("同步失败")
      }
    }).catch((e) => {
      message.error("同步失败")
      console.log(e);
    })
  }

  return (
      <Collapse defaultActiveKey={[]}>
        <Panel header="数据同步" key="1">
    <DivWrapper>
        <Radio.Group onChange={(e) => setPlace(e.target.value)} value={place}>
          <Radio value='sh'>上海交易所</Radio>
          <Radio value='zz'>郑州交易所</Radio>
          <Radio value='dl'>大连交易所</Radio>
        </Radio.Group>
        <p />
        <Radio.Group onChange={(e) => setType(e.target.value)} value={type}>
          <Radio value='record'>日交易</Radio>
          <Radio value='contract'>持仓</Radio>
          <Radio value='storehouse'>仓单</Radio>
          <Radio value='history'>品种历史数据</Radio>
        </Radio.Group>
        <p />
        {
          type === 'storehouse' && (place === 'sh' || place === 'dl') ? (
            <div>
              <Input.TextArea value={text} onChange={onChange} style={{ height: "120px" }} />
              <Calendar fullscreen={false} onChange={onPanelChange} />
              <Button style={{ marginTop: "12px" }} onClick={() => submit()}>提交</Button>
            </div>
          ) : (
            <Upload {...props}>
              <Button>上传</Button>
            </Upload>
          )
        }
        <Divider />
        <Radio.Group onChange={(e) => setTimeType(e.target.value)} value={timeType}>
          <Radio value='60'>60分钟</Radio>
          <Radio value='30'>30分钟</Radio>
          <Radio value='15'>15分钟</Radio>
          <Radio value='5'>5分钟</Radio>
          <Radio value='all'>全部(不含日)</Radio>
        </Radio.Group>
        <Button style={{marginTop:"12px"}} onClick={syncSina}>同步新浪数据</Button>
      </DivWrapper>
        </Panel>
        <Panel header="品种资金流向" key="2">
          <Table style={{width: '300px'}} dataSource={table_data} columns={columns} pagination={{defaultPageSize: 70}}/>
          <Button onClick={submitMoneyFlow}>提交</Button>
        </Panel>
      </Collapse>
  );
}

export default Uploader;