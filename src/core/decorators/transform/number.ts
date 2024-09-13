import { Transform, TransformFnParams } from 'class-transformer';

export const TransformNumber = () =>
  Transform(({ value }: TransformFnParams) =>
    typeof value === 'number' ? value : Number(value),
  );
