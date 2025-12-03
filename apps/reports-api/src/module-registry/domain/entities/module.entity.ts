export class Module {
  constructor(
    public readonly id: number,
    public readonly sourceValue: string,
    public readonly displayValue: string,
    public readonly application: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
