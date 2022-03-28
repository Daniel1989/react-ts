import React, { useState } from 'react';
import styled from 'styles/styled-components';
import { Calendar, message, Button, Upload, Radio, Input } from 'antd';
import request from 'utils/request';

const DivWrapper = styled.div`
  padding-top: 12px;
  width: 300px;
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
    request(`http://127.0.0.1:8000/polls/upload/${place}/${type}`, {
      method: 'post',
      body: JSON.stringify({ data: text, place, date: dateStr })
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


  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'))
    setDateStr(value.format('YYYY-MM-DD'))
  }
  return (
    <DivWrapper>
      <Radio.Group onChange={(e) => setPlace(e.target.value)} value={place}>
        <Radio value='sh'>上海交易所</Radio>
        <Radio value='zz'>郑州交易所</Radio>
        <Radio value='dl'>大连交易所</Radio>
      </Radio.Group>
      <Radio.Group onChange={(e) => setType(e.target.value)} value={type}>
        <Radio value='record'>日交易</Radio>
        <Radio value='contract'>持仓</Radio>
        <Radio value='storehouse'>仓单</Radio>
      </Radio.Group>
      <p />
      {
        type === 'storehouse' && (place === 'sh' || place === 'dl') ? (
          <div>
            <Input.TextArea defaultValue={''} onChange={onChange} style={{ height: "120px" }} />
            <Calendar fullscreen={false} onChange={onPanelChange} />
            <Button style={{ marginTop: "12px" }} onClick={() => submit()}>提交</Button>
          </div>
        ) : (
          <Upload {...props}>
            <Button>上传</Button>
          </Upload>
        )
      }

    </DivWrapper>
  )
}

export default Uploader;