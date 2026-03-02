type DataPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

type DataMap = {
  [key: string]: DataValue;
};

type DataList = DataValue[];

type DataValue = DataPrimitive | Date | DataMap | DataList;
