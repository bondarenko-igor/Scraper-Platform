import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label, FieldError } from '@/components/ui/label'
import { useCreateJob } from '@/hooks/use-jobs'
import { createJobSchema, type CreateJobFormValues } from './create-job.schema'

interface CreateJobModalProps {
  open: boolean
  onClose: () => void
}

export function CreateJobModal({ open, onClose }: CreateJobModalProps) {
  const createJob = useCreateJob()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      source_type: 'generic',
      priority: 0,
      max_attempts: 3,
      metadataJson: '{}',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    let metadata: Record<string, unknown> = {}
    if (values.metadataJson?.trim()) {
      metadata = JSON.parse(values.metadataJson) as Record<string, unknown>
    }
    await createJob.mutateAsync({
      url: values.url,
      source_type: values.source_type,
      priority: values.priority,
      max_attempts: values.max_attempts,
      extraction_instruction: values.extraction_instruction || null,
      metadata,
    })
    reset()
    onClose()
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Job"
      description="Enqueue a scrape via POST /v1/jobs"
      className="max-w-xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="url">URL *</Label>
          <Input id="url" placeholder="https://example.com/page" {...register('url')} />
          <FieldError message={errors.url?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="source_type">Source Type</Label>
            <Select id="source_type" {...register('source_type')}>
              <option value="generic">generic</option>
              <option value="olx">olx</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input id="priority" type="number" {...register('priority', { valueAsNumber: true })} />
            <FieldError message={errors.priority?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="max_attempts">Max Attempts</Label>
          <Input id="max_attempts" type="number" {...register('max_attempts', { valueAsNumber: true })} />
        </div>

        <div>
          <Label htmlFor="extraction_instruction">Extraction Instruction</Label>
          <Textarea
            id="extraction_instruction"
            rows={2}
            className="font-sans"
            placeholder="Extract title, price, and seller details…"
            {...register('extraction_instruction')}
          />
        </div>

        <div>
          <Label htmlFor="metadataJson">Metadata (JSON)</Label>
          <Textarea id="metadataJson" rows={4} {...register('metadataJson')} />
          <FieldError message={errors.metadataJson?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createJob.isPending}>
            Create Job
          </Button>
        </div>
      </form>
    </Modal>
  )
}
