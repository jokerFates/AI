import { Form, Input, message } from "antd";
import { FormInstance, useForm } from "antd/es/form/Form";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { CardType } from "@/ts/enums/login";
import { loginAction, logonAction } from "@/stores/slice/user";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/stores";
import { useNavigate } from "react-router-dom";

type Props = {
    type: CardType
}

export type CardRef = {
    form: FormInstance,
}

const CardForm = forwardRef<CardRef, Props>((props, ref) => {

    const { type } = props
    const [form] = useForm()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    useImperativeHandle(ref, () => ({
        form,
        onFilish
    }))

    const onFilish = async (value: Login.LoginParams) => {
        if (type === CardType.Login) {
            const res = await dispatch(loginAction(value))
            if (res.payload) {
                navigate('/layout')
            }
        }
        else {
            dispatch(logonAction(value))
        }
    }

    useEffect(() => {
        form.resetFields()
    }, [type])

    return (
        <Form
            form={form}
            onFinish={onFilish}
            style={{ maxWidth: 600 }}
        >
            <Form.Item
                name='username'
                rules={[{ required: true, message: '请输入用户名' }]}
            >
                <Input placeholder="请输入用户名" prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
                name='password'
                rules={[{ required: true, message: '请输入密码' }]}
            >
                <Input placeholder="请输入密码" prefix={<LockOutlined />} />
            </Form.Item>
        </Form>
    )
})

export default CardForm