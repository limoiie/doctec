import {
  CheckCircleFilled,
  CloseCircleFilled,
  FieldTimeOutlined,
  QuestionCircleFilled,
  StopFilled
} from "@ant-design/icons";

export function StatusIcon({status, className = ""}: {
  status: string,
  className?: string
}) {
  switch (status) {
    case 'pending':
      return <QuestionCircleFilled className={"text-yellow-500 " + className}/>;
    case 'in-progress':
      return <FieldTimeOutlined className={"text-blue-500 " + className}/>;
    case 'completed':
      return <CheckCircleFilled className={"text-green-500 " + className}/>;
    case 'failed':
      return <CloseCircleFilled className={"text-red-500 " + className}/>;
    case 'cancelled':
      return <StopFilled className={"text-purple-500 " + className}/>;
    default:
      return null;
  }
}