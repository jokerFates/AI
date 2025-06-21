import { FC, useRef, useState } from "react";
import { Card, Button, Typography, Flex } from "antd";
import CardForm, { CardRef } from "./CardForm/index";
import { CardType } from "@/ts/enums/login";
import styles from './index.module.scss';
import Link from "antd/es/typography/Link";

const Login: FC = () => {
    const [curType, setCurType] = useState(CardType.Login);
    const formRef = useRef<CardRef>(null);

    return (
        <div className={styles.loginContainer}>
            <Card className={styles.loginCard}>
                <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
                    智阅书答
                </Typography.Title>
                <CardForm ref={formRef} type={curType} />
                <Button type='primary' onClick={() => { formRef.current.form.submit() }}>
                    {curType === CardType.Login ? '登录' : '注册'}
                </Button>
                <Flex justify='end' style={{ marginTop: '5px', padding: '5px' }}>
                    <Link style={{ color: '#f28800' }} onClick={() => { curType === CardType.Login ? setCurType(CardType.Logon) : setCurType(CardType.Login) }}> {curType === CardType.Login ? '注册' : '登录'}</Link>
                </Flex>
            </Card>
        </div>
    );
};

export default Login;